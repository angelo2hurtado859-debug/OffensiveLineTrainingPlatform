
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { useStore, type Play } from '../store';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, Lock, ArrowLeft } from 'lucide-react';
import SimulatorCanvas from '../components/simulator/SimulatorCanvas';

export default function Playbook() {
  const { user, team, addPlay } = useStore();

  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlayName, setNewPlayName] = useState('');
  const [newPlayNotes, setNewPlayNotes] = useState('');
  const [playAssignments, setPlayAssignments] =
    useState<Record<string, { targetId: string; type: string }>>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isCoach = user?.role === 'coach';
  const plays = team?.plays || [];
  const editorOpen = isCreating || editingPlay !== null;

  const startCreate = () => {
    setEditingPlay(null);
    setNewPlayName('');
    setNewPlayNotes('');
    setPlayAssignments({});
    setSaveError('');
    setIsCreating(true);
  };

  const startEdit = (play: Play) => {
    setIsCreating(false);
    setEditingPlay(play);
    setNewPlayName(play.name);
    setNewPlayNotes(play.notes || '');
    setPlayAssignments(play.assignments || {});
    setSaveError('');
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingPlay(null);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!newPlayName.trim()) {
      setSaveError('Enter a play name.');
      return;
    }

    if (!team) {
      setSaveError('You must be on a team to save plays.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      if (editingPlay) {
        const updatedFields = {
          name: newPlayName.trim(),
          formation: editingPlay.formation || 'Pro',
          type: editingPlay.type || 'Run',
          assignments: playAssignments,
          notes: newPlayNotes,
        };

        const { error } = await supabase
          .from('plays')
          .update(updatedFields)
          .eq('id', editingPlay.id)
          .eq('team_id', team.id);

        if (error) throw error;

        useStore.setState(state => {
          if (!state.team || state.team.id !== team.id) return {};

          return {
            team: {
              ...state.team,
              plays: state.team.plays.map(play =>
                play.id === editingPlay.id
                  ? { ...play, ...updatedFields }
                  : play
              ),
            },
          };
        });
      } else {
        await addPlay({
          id: crypto.randomUUID(),
          name: newPlayName.trim(),
          formation: 'Pro',
          type: 'Run',
          status: 'draft',
          assignments: playAssignments,
          notes: newPlayNotes,
        });
      }

      cancelEdit();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Could not save this play.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (editorOpen) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={cancelEdit}>
          <ArrowLeft size={16} />
          <span className="ml-2">Back to Playbook</span>
        </Button>

        <h1 className="text-3xl font-display font-bold text-foreground">
          {editingPlay ? 'Edit Play' : 'Create New Play'}
        </h1>

        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Play Name
            </label>
            <Input
              value={newPlayName}
              onChange={event => setNewPlayName(event.target.value)}
              placeholder="e.g. Power Right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Coaching Points & Rules
            </label>
            <textarea
              value={newPlayNotes}
              onChange={event => setNewPlayNotes(event.target.value)}
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              rows={4}
              placeholder="Blocking rules, assignments, adjustments..."
            />
          </div>

          <div className="pt-4 pb-2">
            <h3 className="text-lg font-display font-bold mb-2">
              Set Assignments
            </h3>

            <div className="h-[500px]">
              <SimulatorCanvas
                key={editingPlay?.id || 'new-play'}
                initialAssignments={playAssignments}
                onAssignmentsChange={setPlayAssignments}
              />
            </div>
          </div>

          {saveError && (
            <p role="alert" className="text-sm text-red-500">
              {saveError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Play'}
            </Button>

            <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Team Playbook
          </h1>
          <p className="text-muted-foreground mt-1">
            Master your assignments.
          </p>
        </div>

        {isCoach && (
          <Button className="space-x-2" onClick={startCreate}>
            <Plus size={16} />
            <span>Create Play</span>
          </Button>
        )}
      </div>

      {plays.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No plays have been saved yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plays.map(play => {
            const status = play.status || 'draft';
            const locked = status === 'locked';

            return (
              <Card
                key={play.id}
                className={`p-0 overflow-hidden flex flex-col ${
                  locked ? 'opacity-60 grayscale' : ''
                }`}
              >
                <div className="h-32 bg-secondary/50 relative border-b border-border flex items-center justify-center p-4">
                  <BookOpen size={48} className="text-muted-foreground/30" />

                  {locked && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                      <Lock size={24} className="text-foreground" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-display font-bold text-lg">
                      {play.name}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded uppercase tracking-wider font-medium">
                      {play.type || 'Run'}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground font-mono mb-2">
                    {play.formation || 'Pro'}
                  </p>

                  {play.notes && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {play.notes}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mb-4">
                    {Object.keys(play.assignments || {}).length} linemen assigned
                  </p>

                  <div className="mt-auto">
                    <Button
                      variant={status === 'installed' ? 'default' : 'outline'}
                      className="w-full"
                      disabled={locked}
                      onClick={() => {
                        if (isCoach) {
                          startEdit(play);
                        } else {
                          useStore.setState({ selectedPlay: play } as any);
                        }
                      }}
                    >
                      {isCoach ? 'Edit Play' : 'Study Play'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
