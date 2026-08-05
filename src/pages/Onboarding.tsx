import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, Role } from '../store';
import { Button, Input, Card } from '../components/ui';
import { ClipboardList, Users } from 'lucide-react';

export default function Onboarding() {
  const { user, setRole, createTeam, joinTeam, updateProfile } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // Player profile state
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [positions, setPositions] = useState<string[]>(['LT']);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/');
    return null;
  }

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTeam(teamName || 'My Team');
    navigate('/dashboard');
  };

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) {
      setError('Team invite code is required.');
      return;
    }
    const success = joinTeam(inviteCode);
    if (!success) {
      setError('Invalid invite code. Try MEHS-12345');
      return;
    }
    updateProfile({ 
      height: height ? parseInt(height) : undefined, 
      weight: weight ? parseInt(weight) : undefined, 
      positions 
    });
    navigate('/dashboard');
  };

  const togglePosition = (pos: string) => {
    setPositions(prev => 
      prev.includes(pos) 
        ? prev.filter(p => p !== pos) 
        : [...prev, pos]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-foreground">
          {step === 1 ? 'Select Your Role' : user.role === 'coach' ? 'Setup Your Team' : 'Complete Profile'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center space-x-4" onClick={() => handleRoleSelect('coach')}>
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Coach</h3>
                <p className="text-sm text-muted-foreground">Create a team, build playbooks, track players.</p>
              </div>
            </Card>
            
            <Card className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center space-x-4" onClick={() => handleRoleSelect('player')}>
              <div className="p-3 bg-accent/20 rounded-full text-accent-foreground">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Player</h3>
                <p className="text-sm text-muted-foreground">Join a team, study the playbook, test your knowledge.</p>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && user.role === 'coach' && (
          <Card className="p-6 border-accent/50">
            <form onSubmit={handleCoachSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Team Name</label>
                <Input value={teamName} onChange={e => setTeamName(e.target.value)} required placeholder="e.g. MEHS Varsity" className="bg-secondary/50" />
              </div>
              <Button type="submit" className="w-full">Create Team</Button>
            </form>
          </Card>
        )}

        {step === 2 && user.role === 'player' && (
          <Card className="p-6 border-accent/50">
            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              {error && <div className="text-red-400 text-sm font-medium">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Invite Code *</label>
                <Input value={inviteCode} onChange={e => setInviteCode(e.target.value)} required placeholder="e.g. MEHS-12345" className="bg-secondary/50 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Height (inches)</label>
                  <Input type="number" min="60" max="84" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 74" className="bg-secondary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Weight (lbs)</label>
                  <Input type="number" min="150" max="400" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 285" className="bg-secondary/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Positions (Select all that apply)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['LT', 'LG', 'C', 'RG', 'RT', 'TE'].map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => togglePosition(pos)}
                      className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                        positions.includes(pos) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={positions.length === 0}>Join & Continue</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
