
import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../components/ui';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_OFFENSE = [
  { id: 'LT', label: 'LT', x: 200, y: 300 },
  { id: 'LG', label: 'LG', x: 280, y: 300 },
  { id: 'C', label: 'C', x: 360, y: 290 },
  { id: 'RG', label: 'RG', x: 440, y: 300 },
  { id: 'RT', label: 'RT', x: 520, y: 300 },
];

const INITIAL_DEFENSE = [
  { id: 'D1', label: 'E', x: 200, y: 240, tech: '5' },
  { id: 'D2', label: 'T', x: 320, y: 240, tech: '2i' },
  { id: 'D3', label: 'N', x: 400, y: 240, tech: '2i' },
  { id: 'D4', label: 'E', x: 520, y: 240, tech: '5' },
  { id: 'M', label: 'M', x: 360, y: 150, tech: 'MLB' },
];

export type Assignment = {
  targetId: string;
  type: string;
};

type SimulatorProps = {
  initialAssignments?: Record<string, Assignment>;
  onAssignmentsChange?: (assignments: Record<string, Assignment>) => void;
};

export default function SimulatorCanvas({
  initialAssignments = {},
  onAssignmentsChange,
}: SimulatorProps) {
  const [selectedO, setSelectedO] = useState<string | null>(null);
  const [assignments, setAssignments] =
    useState<Record<string, Assignment>>(initialAssignments);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAssignments(initialAssignments || {});
    setSelectedO(null);
    setMessage('');
  }, [initialAssignments]);

  useEffect(() => {
    onAssignmentsChange?.(assignments);
  }, [assignments, onAssignmentsChange]);

  const handleSelectO = (id: string) => {
    if (isPlaying) return;
    setMessage('');
    setSelectedO(current => (current === id ? null : id));
  };

  const handleSelectD = (
    dId: string,
    zoneType: 'center' | 'left' | 'right' | 'zone' | 'pass'
  ) => {
    if (!selectedO || isPlaying) return;

    const blockTypes: Record<string, string> = {
      center: 'Base Block',
      left: 'Reach Left',
      right: 'Reach Right',
      zone: 'Zone Block',
      pass: 'Pass Set',
    };

    setAssignments(previous => ({
      ...previous,
      [selectedO]: {
        targetId: dId,
        type: blockTypes[zoneType],
      },
    }));

    setSelectedO(null);
    setMessage('');
  };

  const resetAssignments = () => {
    if (isPlaying) return;
    setAssignments({});
    setSelectedO(null);
    setMessage('Assignments cleared.');
  };

  const runPlay = () => {
    if (isPlaying) return;

    setSelectedO(null);
    setIsPlaying(true);
    setMessage('');

    window.setTimeout(() => {
      setIsPlaying(false);
      const count = Object.keys(assignments).length;
      setMessage(
        `Simulation complete. ${count} of ${INITIAL_OFFENSE.length} linemen have assignments.`
      );
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-display font-bold">
            Inside Zone Right
          </h2>
          <p className="text-muted-foreground text-sm">
            Select an O-lineman, then select a defender to assign a block.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={resetAssignments}
            disabled={isPlaying}
            variant="outline"
          >
            Reset Assignments
          </Button>

          <Button onClick={runPlay} disabled={isPlaying} className="space-x-2">
            <Play size={16} />
            <span>{isPlaying ? 'Running...' : 'Run Play'}</span>
          </Button>
        </div>
      </div>

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <Card className="flex-1 relative overflow-hidden bg-[#0a150f] border-border turf-pattern rounded-xl p-4 flex items-center justify-center min-h-[300px]">
        <svg
          viewBox="0 0 720 480"
          className="w-full h-full max-w-4xl mx-auto drop-shadow-2xl"
        >
          <line
            x1="0"
            y1="280"
            x2="720"
            y2="280"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="10 10"
            opacity="0.3"
          />

          {Object.entries(assignments).map(([oId, assignment]) => {
            const offense = INITIAL_OFFENSE.find(item => item.id === oId);
            const defense = INITIAL_DEFENSE.find(
              item => item.id === assignment.targetId
            );

            if (!offense || !defense) return null;

            let path = `M ${offense.x} ${offense.y - 15} L ${defense.x} ${defense.y + 15}`;

            if (assignment.type === 'Reach Left') {
              path = `M ${offense.x} ${offense.y - 15} Q ${offense.x - 30} ${offense.y - 25} ${defense.x - 15} ${defense.y + 15}`;
            } else if (assignment.type === 'Reach Right') {
              path = `M ${offense.x} ${offense.y - 15} Q ${offense.x + 30} ${offense.y - 25} ${defense.x + 15} ${defense.y + 15}`;
            } else if (assignment.type === 'Zone Block') {
              path = `M ${offense.x} ${offense.y - 15} Q ${(offense.x + defense.x) / 2 + 20} ${(offense.y + defense.y) / 2} ${defense.x} ${defense.y + 15}`;
            } else if (assignment.type === 'Pass Set') {
              path = `M ${offense.x} ${offense.y - 15} L ${offense.x} ${offense.y - 65} L ${defense.x} ${defense.y + 15}`;
            }

            return (
              <motion.path
                key={`${oId}-${assignment.targetId}`}
                d={path}
                fill="none"
                stroke={isPlaying ? '#c5a059' : '#1e3a8a'}
                strokeWidth="4"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {INITIAL_DEFENSE.map(defender => (
            <g
              key={defender.id}
              transform={`translate(${defender.x}, ${defender.y})`}
            >
              {selectedO && !isPlaying && (
                <g className="cursor-pointer">
                  <path
                    d="M -15,0 L -40,0 L -30,25 L -10,20 Z"
                    fill="#3b82f6"
                    onClick={() => handleSelectD(defender.id, 'left')}
                  />
                  <path
                    d="M 15,0 L 40,0 L 30,25 L 10,20 Z"
                    fill="#3b82f6"
                    onClick={() => handleSelectD(defender.id, 'right')}
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="18"
                    fill="#1e40af"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    onClick={() => handleSelectD(defender.id, 'center')}
                  />
                </g>
              )}

              <circle
                cx="0"
                cy="0"
                r="14"
                fill="#1e293b"
                stroke="#ef4444"
                strokeWidth="2"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                {defender.label}
              </text>
              <text
                x="0"
                y="-22"
                textAnchor="middle"
                fill="#fca5a5"
                fontSize="10"
              >
                {defender.tech}
              </text>
            </g>
          ))}

          {INITIAL_OFFENSE.map(lineman => (
            <g
              key={lineman.id}
              transform={`translate(${lineman.x}, ${lineman.y})`}
              onClick={() => handleSelectO(lineman.id)}
              className={isPlaying ? '' : 'cursor-pointer'}
            >
              <circle
                cx="0"
                cy="0"
                r="16"
                fill={selectedO === lineman.id ? '#c5a059' : '#020617'}
                stroke={selectedO === lineman.id ? '#fff' : '#c5a059'}
                strokeWidth="3"
              />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill={selectedO === lineman.id ? '#000' : '#fff'}
                fontSize="14"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                {lineman.id}
              </text>
            </g>
          ))}

          {isPlaying && (
            <g>
              {INITIAL_OFFENSE.map(lineman => {
                const assignment = assignments[lineman.id];
                const target = INITIAL_DEFENSE.find(
                  defender => defender.id === assignment?.targetId
                );

                if (!target) return null;

                return (
                  <motion.circle
                    key={`moving-${lineman.id}`}
                    r="10"
                    fill="#c5a059"
                    initial={{ cx: lineman.x, cy: lineman.y }}
                    animate={{ cx: target.x, cy: target.y + 25 }}
                    transition={{ duration: 1.2 }}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </Card>
    </div>
  );
}
