import React, { useState } from 'react';
import { Card, Button } from '../../components/ui';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for initial setup
const INITIAL_OFFENSE = [
  { id: 'LT', label: 'LT', x: 200, y: 300, isCenter: false },
  { id: 'LG', label: 'LG', x: 280, y: 300, isCenter: false },
  { id: 'C',  label: 'C',  x: 360, y: 290, isCenter: true },
  { id: 'RG', label: 'RG', x: 440, y: 300, isCenter: false },
  { id: 'RT', label: 'RT', x: 520, y: 300, isCenter: false },
];

const INITIAL_DEFENSE = [
  { id: 'D1', label: 'E', x: 200, y: 240, tech: '5' },
  { id: 'D2', label: 'T', x: 320, y: 240, tech: '2i' },
  { id: 'D3', label: 'N', x: 400, y: 240, tech: '2i' },
  { id: 'D4', label: 'E', x: 520, y: 240, tech: '5' },
  { id: 'M',  label: 'M', x: 360, y: 150, tech: 'MLB' },
];

export default function Simulator() {
  const [selectedO, setSelectedO] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, { targetId: string, type: string }>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectO = (id: string) => {
    if (isPlaying) return;
    setSelectedO(id === selectedO ? null : id);
  };

  const handleSelectD = (dId: string, zoneType: 'center' | 'left' | 'right' | 'zone' | 'pass') => {
    if (!selectedO || isPlaying) return;
    
    let blockType = 'Base Block';
    if (zoneType === 'left') blockType = 'Reach Left';
    if (zoneType === 'right') blockType = 'Reach Right';
    if (zoneType === 'zone') blockType = 'Zone Block';
    if (zoneType === 'pass') blockType = 'Pass Set';
    
    setAssignments(prev => ({
      ...prev,
      [selectedO]: { targetId: dId, type: blockType }
    }));
    setSelectedO(null);
  };

  const shuffleDefense = () => {
    // Basic shuffle implementation
    setAssignments({});
    // In a full implementation, this would randomize INITIAL_DEFENSE tech alignments
    alert("Defense Shuffled (Mock)");
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Inside Zone Right</h2>
          <p className="text-muted-foreground text-sm">Select an O-Lineman, then select a defender zone.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={shuffleDefense} disabled={isPlaying} variant="outline">
            Shuffle Defense
          </Button>
          <Button onClick={runPlay} disabled={isPlaying} className="space-x-2">
            <Play size={16} />
            <span>Run Play</span>
          </Button>
        </div>
      </div>

      <Card className="flex-1 relative overflow-hidden bg-[#0a150f] border-border turf-pattern rounded-xl p-4 flex items-center justify-center">
        <svg viewBox="0 0 720 480" className="w-full h-full max-w-4xl mx-auto drop-shadow-2xl">
          {/* Hash marks and lines (simplified) */}
          <line x1="0" y1="280" x2="720" y2="280" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 10" opacity="0.3" />
          
          {/* Draw Assignments Lines */}
          {Object.entries(assignments).map(([oId, assignment]) => {
            const o = INITIAL_OFFENSE.find(x => x.id === oId);
            const d = INITIAL_DEFENSE.find(x => x.id === assignment.targetId);
            if (!o || !d) return null;
            
            // Dynamic path generation based on selection
            let pathD = `M ${o.x} ${o.y - 15} L ${d.x} ${d.y + 15}`;
            if (assignment.type === 'Reach Left') {
              // C-shaped curve preventing defender from crossing left
              pathD = `M ${o.x} ${o.y - 15} Q ${o.x - 30} ${o.y - 25} ${d.x - 15} ${d.y + 15}`;
            } else if (assignment.type === 'Reach Right') {
              // Inverted C-shaped curve
              pathD = `M ${o.x} ${o.y - 15} Q ${o.x + 30} ${o.y - 25} ${d.x + 15} ${d.y + 15}`;
            }
            
            return (
              <motion.path
                key={`${oId}-${d.id}`}
                d={pathD}
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

          {/* Defense Rendering */}
          {INITIAL_DEFENSE.map(d => (
            <g key={d.id} transform={`translate(${d.x}, ${d.y})`} className="transition-transform duration-500">
              {/* Target Zones (only show when O is selected) */}
              {selectedO && !isPlaying && (
                <g className="cursor-pointer opacity-70 hover:opacity-100">
                  {/* Left Reach Zone - wider face towards O-lineman (bottom) */}
                  <path d="M -15,0 L -40,0 L -30,25 L -10,20 Z" fill="#3b82f6" onClick={() => handleSelectD(d.id, 'left')} />
                  {/* Right Reach Zone - wider face towards O-lineman (bottom) */}
                  <path d="M 15,0 L 40,0 L 30,25 L 10,20 Z" fill="#3b82f6" onClick={() => handleSelectD(d.id, 'right')} />
                  {/* Center Base Zone */}
                  <circle cx="0" cy="0" r="18" fill="#1e40af" stroke="#60a5fa" strokeWidth="2" onClick={() => handleSelectD(d.id, 'center')} />
                </g>
              )}
              
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">{d.label}</text>
            </g>
          ))}

          {/* Offense Rendering */}
          {INITIAL_OFFENSE.map(o => (
            <g 
              key={o.id} 
              transform={`translate(${o.x}, ${o.y})`} 
              onClick={() => handleSelectO(o.id)}
              className="cursor-pointer"
            >
              <circle 
                cx="0" cy="0" r="16" 
                fill={selectedO === o.id ? '#c5a059' : '#020617'} 
                stroke={selectedO === o.id ? '#fff' : '#c5a059'} 
                strokeWidth="3" 
              />
              <text x="0" y="5" textAnchor="middle" fill={selectedO === o.id ? '#000' : '#fff'} fontSize="14" fontFamily="JetBrains Mono" fontWeight="bold">{o.id}</text>
            </g>
          ))}
        </svg>

        {isPlaying && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
             {/* We can add framer-motion animations moving the pieces here in a full build */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0 }}
               className="bg-card/90 text-primary p-4 rounded-lg border border-primary font-display font-bold text-2xl"
             >
               SIMULATING...
             </motion.div>
          </div>
        )}
      </Card>
    </div>
  );
}
