import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { useStore } from '../store';
import { BookOpen, Plus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import SimulatorCanvas from '../components/simulator/SimulatorCanvas';

export default function Playbook() {
  const { user, team, addPlay } = useStore();
  const navigate = useNavigate();
  const isCoach = user?.role === 'coach';
  const [isCreating, setIsCreating] = useState(false);
  const [newPlayName, setNewPlayName] = useState('');
  const [newPlayNotes, setNewPlayNotes] = useState('');

  const plays = team?.plays || [];

  const handleCreatePlay = () => {
    if (!newPlayName) return;
    addPlay({
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayName,
      formation: 'Pro',
      type: 'Run',
      status: 'draft',
      assignments: {},
      notes: newPlayNotes
    });
    setIsCreating(false);
    setNewPlayName('');
    setNewPlayNotes('');
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-foreground">Create New Play</h1>
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Play Name</label>
            <Input value={newPlayName} onChange={e => setNewPlayName(e.target.value)} placeholder="e.g. Power Right" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Coaching Points & Rules</label>
            <textarea 
              value={newPlayNotes} 
              onChange={e => setNewPlayNotes(e.target.value)} 
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={4}
              placeholder="Purpose of the play, blocking rules, adjustments..."
            />
          </div>
          
          <div className="pt-4 pb-2">
            <h3 className="text-lg font-display font-bold mb-2">Set Assignments</h3>
            <div className="h-[400px]">
              <SimulatorCanvas />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleCreatePlay}>Save Play</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Team Playbook</h1>
          <p className="text-muted-foreground mt-1">Master your assignments.</p>
        </div>
        {isCoach && (
          <Button className="space-x-2" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            <span>Create Play</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plays.map(play => (
          <Card key={play.id} className={`p-0 overflow-hidden flex flex-col ${play.status === 'locked' ? 'opacity-60 grayscale' : ''}`}>
            <div className="h-32 bg-secondary/50 relative border-b border-border flex items-center justify-center p-4">
              <BookOpen size={48} className="text-muted-foreground/30" />
              {play.status === 'locked' && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                  <Lock size={24} className="text-foreground" />
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-bold text-lg">{play.name}</h3>
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded uppercase tracking-wider font-medium">
                  {play.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-2">{play.formation}</p>
              {play.notes && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{play.notes}</p>}
              <div className="mt-auto">
                <Button 
                  variant={play.status === 'installed' ? 'default' : 'outline'} 
                  className="w-full"
                  disabled={play.status === 'locked'}
                  onClick={() => play.status === 'installed' ? navigate('/training') : null}
                >
                  {isCoach ? 'Edit Play' : 'Study Play'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
