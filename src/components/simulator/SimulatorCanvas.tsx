import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { Play, Plus, Shuffle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Player = { id: string; label: string; x: number; y: number; tech?: string };
export type Assignment = { targetId: string; type: string };
type FieldSnapshot = { offense: Player[]; defense: Player[] };
type StoredAssignments = Record<string, Assignment | FieldSnapshot>;

const INITIAL_OFFENSE: Player[] = [
  { id: 'LT', label: 'LT', x: 170, y: 320 },
  { id: 'LG', label: 'LG', x: 265, y: 320 },
  { id: 'C', label: 'C', x: 360, y: 320 },
  { id: 'RG', label: 'RG', x: 455, y: 320 },
  { id: 'RT', label: 'RT', x: 550, y: 320 },
];

const INITIAL_DEFENSE: Player[] = [
  { id: 'D1', label: 'E', x: 170, y: 255, tech: '5' },
  { id: 'D2', label: 'T', x: 290, y: 255, tech: '3' },
  { id: 'D3', label: 'N', x: 390, y: 255, tech: '1' },
  { id: 'D4', label: 'E', x: 550, y: 255, tech: '5' },
  { id: 'M', label: 'M', x: 360, y: 175, tech: 'MLB' },
];

const BLOCK_TYPES = ['Base Block', 'Reach Left', 'Reach Right', 'Down Block', 'Pull Tight', 'Pull Wide', 'Double Team', 'Pass Set'];

type SimulatorProps = {
  initialAssignments?: Record<string, any>;
  onAssignmentsChange?: (assignments: Record<string, any>) => void;
  readOnly?: boolean;
};

function extractSnapshot(value: Record<string, any> | undefined): { assignments: Record<string, Assignment>; field?: FieldSnapshot } {
  const source = value || {};
  const assignments: Record<string, Assignment> = {};
  for (const [key, item] of Object.entries(source)) {
    if (key.startsWith('__')) continue;
    if (item && typeof item.targetId === 'string' && typeof item.type === 'string') {
      assignments[key] = { targetId: item.targetId, type: item.type };
    }
  }
  const field = source.__field && Array.isArray(source.__field.offense) && Array.isArray(source.__field.defense)
    ? source.__field as FieldSnapshot
    : undefined;
  return { assignments, field };
}

export default function SimulatorCanvas({
  initialAssignments = {},
  onAssignmentsChange,
  readOnly = false,
}: SimulatorProps) {
  const initial = useMemo(() => extractSnapshot(initialAssignments), [initialAssignments]);
  const [offense, setOffense] = useState<Player[]>(initial.field?.offense || INITIAL_OFFENSE);
  const [defense, setDefense] = useState<Player[]>(initial.field?.defense || INITIAL_DEFENSE);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(initial.assignments);
  const [selectedO, setSelectedO] = useState<string | null>(null);
  const [blockType, setBlockType] = useState('Base Block');
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState<{ side: 'offense' | 'defense'; id: string } | null>(null);
  const [nextDefenderId, setNextDefenderId] = useState(() => Math.max(5, (initial.field?.defense.length || INITIAL_DEFENSE.length) + 1));
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    onAssignmentsChange?.({ ...assignments, __field: { offense, defense } });
  }, [assignments, offense, defense, onAssignmentsChange]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const handleSelectO = (id: string) => {
    if (isPlaying || readOnly) return;
    setMessage('');
    setSelectedO(current => current === id ? null : id);
  };

  const handleSelectD = (dId: string, forcedType?: string) => {
    if (!selectedO || isPlaying || readOnly) return;
    const type = forcedType || blockType;
    setAssignments(previous => ({ ...previous, [selectedO]: { targetId: dId, type } }));
    setMessage(`${selectedO}: ${type} → ${defense.find(player => player.id === dId)?.label || dId}`);
    setSelectedO(null);
  };

  const clearAssignments = () => {
    if (isPlaying || readOnly) return;
    setAssignments({});
    setSelectedO(null);
    setMessage('Assignments cleared. Field alignment kept.');
  };

  const addDefender = () => {
    if (readOnly || isPlaying || defense.length >= 11) return;
    const id = `D${nextDefenderId}`;
    const x = Math.max(55, Math.min(665, 120 + (defense.length * 67) % 500));
    setDefense(previous => [...previous, { id, label: 'T', x, y: 235, tech: '3' }]);
    setNextDefenderId(previous => previous + 1);
    setMessage('Defender added. Drag players to adjust the front.');
  };

  const removeDefender = () => {
    if (readOnly || isPlaying || defense.length <= 1) return;
    const removed = defense[defense.length - 1];
    setDefense(previous => previous.slice(0, -1));
    setAssignments(previous => Object.fromEntries(Object.entries(previous).filter(([, assignment]) => assignment.targetId !== removed.id)));
    setMessage(`${removed.label} removed.`);
  };

  const shuffleDefense = () => {
    if (readOnly || isPlaying) return;
    setDefense(previous => previous.map((player, index) => ({
      ...player,
      x: 80 + Math.random() * 560,
      y: player.tech === 'MLB' ? 145 + Math.random() * 45 : 205 + Math.random() * 65,
    })));
    setMessage('Defense shuffled. Recheck your assignments for the new front.');
  };

  const movePlayer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || isPlaying || readOnly || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(25, Math.min(695, ((event.clientX - rect.left) / rect.width) * 720));
    const y = Math.max(35, Math.min(455, ((event.clientY - rect.top) / rect.height) * 480));
    const update = (items: Player[]) => items.map(player => player.id === dragging.id ? { ...player, x, y } : player);
    if (dragging.side === 'offense') setOffense(update);
    else setDefense(update);
  };

  const runPlay = () => {
    if (isPlaying || readOnly) return;
    setSelectedO(null);
    setIsPlaying(true);
    setMessage('Rep running…');
    timerRef.current = window.setTimeout(() => {
      setIsPlaying(false);
      const count = Object.keys(assignments).length;
      setMessage(`Rep complete: ${count} assignments drawn. Review any unassigned linemen before saving.`);
    }, 1450);
  };

  const assignmentPaths = Object.entries(assignments).map(([oId, assignment]) => {
    const blocker = offense.find(player => player.id === oId);
    const target = defense.find(player => player.id === assignment.targetId);
    if (!blocker || !target) return null;
    const dx = target.x - blocker.x;
    let d = `M ${blocker.x} ${blocker.y - 17} L ${target.x} ${target.y + 16}`;
    if (assignment.type === 'Reach Left') d = `M ${blocker.x} ${blocker.y - 17} C ${blocker.x - 34} ${blocker.y - 28}, ${target.x - 36} ${target.y + 35}, ${target.x - 10} ${target.y + 16}`;
    if (assignment.type === 'Reach Right') d = `M ${blocker.x} ${blocker.y - 17} C ${blocker.x + 34} ${blocker.y - 28}, ${target.x + 36} ${target.y + 35}, ${target.x + 10} ${target.y + 16}`;
    if (assignment.type === 'Zone Block') d = `M ${blocker.x} ${blocker.y - 17} Q ${(blocker.x + target.x) / 2 + 20} ${(blocker.y + target.y) / 2}, ${target.x} ${target.y + 16}`;
    if (assignment.type === 'Down Block') d = `M ${blocker.x} ${blocker.y - 17} Q ${blocker.x + dx * .25} ${blocker.y - 8}, ${target.x} ${target.y + 16}`;
    if (assignment.type === 'Pull Tight') d = `M ${blocker.x} ${blocker.y - 17} C ${blocker.x + dx * .2} ${blocker.y - 60}, ${blocker.x + dx * .75} ${blocker.y - 55}, ${target.x} ${target.y + 16}`;
    if (assignment.type === 'Pull Wide') d = `M ${blocker.x} ${blocker.y - 17} C ${blocker.x + dx * .1} ${blocker.y - 100}, ${blocker.x + dx * .9} ${blocker.y - 90}, ${target.x} ${target.y + 16}`;
    if (assignment.type === 'Pass Set') d = `M ${blocker.x} ${blocker.y - 17} L ${blocker.x} ${blocker.y - 72} L ${target.x} ${target.y + 16}`;
    return { key: oId, d, double: assignment.type === 'Double Team' };
  });

  return (
    <div className="flex h-full min-h-[420px] flex-col space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold">Field Assignment Editor</h2>
          <p className="text-sm text-muted-foreground">Select a lineman, choose a rule, then select a defender. Drag either side to adjust alignment.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!readOnly && <Button variant="outline" size="sm" onClick={addDefender} disabled={isPlaying || defense.length >= 11}><Plus size={14} className="mr-1" /> Add Defender</Button>}
          {!readOnly && <Button variant="outline" size="sm" onClick={removeDefender} disabled={isPlaying || defense.length <= 1}><Trash2 size={14} className="mr-1" /> Remove Last</Button>}
          {!readOnly && <Button variant="outline" size="sm" onClick={shuffleDefense} disabled={isPlaying}><Shuffle size={14} className="mr-1" /> Shuffle Front</Button>}
          {!readOnly && <Button variant="outline" size="sm" onClick={clearAssignments} disabled={isPlaying}>Clear Assignments</Button>}
          {!readOnly && <Button size="sm" onClick={runPlay} disabled={isPlaying}><Play size={14} className="mr-1" /> {isPlaying ? 'Running…' : 'Run Rep'}</Button>}
        </div>
      </div>

      {!readOnly && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3">
        <span className="mr-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Block rule</span>
        {BLOCK_TYPES.map(type => <button type="button" key={type} onClick={() => { setBlockType(type); setMessage(`Selected rule: ${type}`); }} className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${blockType === type ? 'border-primary bg-primary text-black' : 'border-border bg-background text-foreground hover:border-primary/60'}`}>{type}</button>)}
      </div>}

      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}

      <Card className="relative flex-1 overflow-hidden rounded-xl border-border bg-[#0a150f] p-2 sm:p-4">
        <svg
          ref={svgRef}
          viewBox="0 0 720 480"
          className="mx-auto block h-full min-h-[350px] w-full max-w-5xl touch-none"
          onPointerMove={movePlayer}
          onPointerUp={() => setDragging(null)}
          onPointerCancel={() => setDragging(null)}
        >
          <defs>
            <pattern id="fieldGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" /></pattern>
            <marker id="assignmentArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#c5a059" /></marker>
          </defs>
          <rect x="0" y="0" width="720" height="480" fill="url(#fieldGrid)" />
          <line x1="20" y1="288" x2="700" y2="288" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 10" opacity="0.32" />
          <text x="18" y="275" fill="#94a3b8" fontSize="10">LINE OF SCRIMMAGE</text>

          {assignmentPaths.map(path => path && (
            <motion.path key={path.key} d={path.d} fill="none" stroke={isPlaying ? '#c5a059' : '#60a5fa'} strokeWidth={path.double ? 6 : 3.5} strokeDasharray={path.double ? '3 3' : '7 5'} markerEnd="url(#assignmentArrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .35 }} />
          ))}

          {defense.map(player => (
            <g key={player.id} transform={`translate(${player.x}, ${player.y})`} onPointerDown={event => { if (!readOnly && !isPlaying) { event.stopPropagation(); setDragging({ side: 'defense', id: player.id }); } }}>
              {!readOnly && selectedO && !isPlaying && <>
                <path d="M -15,0 L -39,-4 L -29,25 L -10,19 Z" fill="#2563eb" fillOpacity=".75" stroke="#93c5fd" strokeWidth="1" className="cursor-pointer" onClick={() => handleSelectD(player.id, 'Reach Left')} />
                <path d="M 15,0 L 39,-4 L 29,25 L 10,19 Z" fill="#2563eb" fillOpacity=".75" stroke="#93c5fd" strokeWidth="1" className="cursor-pointer" onClick={() => handleSelectD(player.id, 'Reach Right')} />
              </>}
              <circle r="15" fill="#1e293b" stroke="#ef4444" strokeWidth="2.5" className={readOnly ? '' : 'cursor-grab'} onClick={() => handleSelectD(player.id)} />
              <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold" pointerEvents="none">{player.label}</text>
              <text x="0" y="-22" textAnchor="middle" fill="#fca5a5" fontSize="10" pointerEvents="none">{player.tech || 'DL'}</text>
            </g>
          ))}

          {offense.map(player => (
            <g key={player.id} transform={`translate(${player.x}, ${player.y})`} onPointerDown={event => { if (!readOnly && !isPlaying) { event.stopPropagation(); setDragging({ side: 'offense', id: player.id }); } }} onClick={() => handleSelectO(player.id)} className={readOnly || isPlaying ? '' : 'cursor-grab'}>
              <circle r="18" fill={selectedO === player.id ? '#facc15' : '#020617'} stroke={selectedO === player.id ? '#ffffff' : '#c5a059'} strokeWidth="3" />
              <text x="0" y="5" textAnchor="middle" fill={selectedO === player.id ? '#000' : '#fff'} fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold" pointerEvents="none">{player.label}</text>
            </g>
          ))}

          {isPlaying && offense.map(player => {
            const assignment = assignments[player.id];
            const target = defense.find(item => item.id === assignment?.targetId);
            if (!target) return null;
            return <motion.circle key={`moving-${player.id}`} r="9" fill="#facc15" stroke="#020617" strokeWidth="2" initial={{ cx: player.x, cy: player.y }} animate={{ cx: target.x, cy: target.y + 22 }} transition={{ duration: 1.15, delay: Math.abs(player.x - 360) / 1800 }} />;
          })}
        </svg>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {offense.map(player => {
          const assignment = assignments[player.id];
          return <div key={player.id} className="rounded-md border border-border bg-secondary/30 p-2 text-xs"><div className="flex items-center justify-between gap-1"><span className="font-bold text-primary">{player.label}</span><span className={assignment ? 'text-primary' : 'text-muted-foreground'}>{assignment ? 'Assigned' : 'Open'}</span></div><p className="mt-1 truncate text-muted-foreground">{assignment ? `${assignment.type} → ${defense.find(d => d.id === assignment.targetId)?.label || assignment.targetId}` : 'Select to assign'}</p></div>;
        })}
      </div>
    </div>
  );
}
