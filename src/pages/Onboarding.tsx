import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store';
import type { Role } from '../store';
import { Button, Input, Card } from '../components/ui';
import { ClipboardList, Users } from 'lucide-react';

export default function Onboarding() {
  const {
    user,
    team,
    setRole,
    createTeam,
    joinTeam,
    updateProfile,
  } = useStore();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft-in'>('ft-in');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('10');
  const [weight, setWeight] = useState('');
  const [positions, setPositions] = useState<string[]>(['LT']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    if (team) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (user.role) {
      setStep(2);
    }
  }, [user, team, navigate]);

  if (!user || team) {
    return null;
  }

  const handleRoleSelect = async (role: Role) => {
    try {
      setError('');
      setLoading(true);

      await setRole(role);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not set your role.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError('Team name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTeam(teamName.trim());
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not create team.');
    } finally {
      setLoading(false);
    }
  };

  const handleHeightUnitChange = (unit: 'cm' | 'ft-in') => {
    if (unit === heightUnit) return;

    if (unit === 'cm') {
      const totalInches = Math.max(0, Number(heightFeet || 0) * 12 + Number(heightInches || 0));
      setHeight(totalInches ? String(Math.round(totalInches * 2.54)) : '');
    } else {
      const totalInches = Math.max(0, Number(height || 0) / 2.54);
      setHeightFeet(totalInches ? String(Math.floor(totalInches / 12)) : '');
      setHeightInches(totalInches ? String(Math.round(totalInches % 12)) : '');
      if (totalInches && Math.round(totalInches % 12) === 12) {
        setHeightFeet(String(Math.floor(totalInches / 12) + 1));
        setHeightInches('0');
      }
    }

    setHeightUnit(unit);
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Team invite code is required.');
      return;
    }

    if (positions.length === 0) {
      setError('Select at least one position.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await joinTeam(inviteCode);

      if (!success) {
        setError('Invalid team code or you are already on a team.');
        return;
      }

      await updateProfile({
        height: heightUnit === 'cm'
          ? (height ? Number(height) : undefined)
          : (heightFeet !== '' || heightInches !== ''
              ? Math.round((Number(heightFeet || 0) * 12 + Number(heightInches || 0)) * 2.54)
              : undefined),
        weight: weight ? Number(weight) : undefined,
        positions,
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to join team.');
    } finally {
      setLoading(false);
    }
  };

  const togglePosition = (pos: string) => {
    setPositions((prev) =>
      prev.includes(pos)
        ? prev.filter((p) => p !== pos)
        : [...prev, pos]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-foreground">
          {step === 1
            ? 'Select Your Role'
            : user.role === 'coach'
              ? 'Create Your Team'
              : 'Join Your Team'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {error && (
          <div className="mb-4 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center space-x-4"
              onClick={() => !loading && handleRoleSelect('coach')}
            >
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ClipboardList size={24} />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold">
                  Coach
                </h3>

                <p className="text-sm text-muted-foreground">
                  Create a team, build playbooks, track players.
                </p>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center space-x-4"
              onClick={() => !loading && handleRoleSelect('player')}
            >
              <div className="p-3 bg-accent/20 rounded-full text-accent-foreground">
                <Users size={24} />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold">
                  Player
                </h3>

                <p className="text-sm text-muted-foreground">
                  Join a team, study the playbook, test your knowledge.
                </p>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && user.role === 'coach' && (
          <Card className="p-6 border-accent/50">
            <form onSubmit={handleCoachSubmit} className="space-y-4">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Name"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Team'}
              </Button>
            </form>
          </Card>
        )}

        {step === 2 && user.role === 'player' && (
          <Card className="p-6 border-accent/50">
            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="MEHS-12345"
                required
              />

              <div className="space-y-2">
                <label htmlFor="height-unit" className="block text-sm font-medium">Height units</label>
                <select
                  id="height-unit"
                  value={heightUnit}
                  onChange={(e) => handleHeightUnitChange(e.target.value as 'cm' | 'ft-in')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="ft-in">Feet and inches (ft / in)</option>
                  <option value="cm">Centimeters (cm)</option>
                </select>
                {heightUnit === 'cm' ? (
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Height in centimeters"
                    min="50"
                    max="260"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-sm">Feet
                      <Input
                        type="number"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                        placeholder="Feet"
                        min="2"
                        max="8"
                      />
                    </label>
                    <label className="text-sm">Inches
                      <Input
                        type="number"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        placeholder="Inches"
                        min="0"
                        max="11"
                      />
                    </label>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Height is saved in centimeters so the team profile can use one consistent unit.</p>
              </div>

              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight"
                min="1"
              />

              <div className="grid grid-cols-3 gap-2">
                {['LT', 'LG', 'C', 'RG', 'RT', 'TE'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`py-2 rounded ${
                      positions.includes(pos)
                        ? 'bg-primary text-white'
                        : 'bg-secondary'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || positions.length === 0}
              >
                {loading ? 'Joining...' : 'Join & Continue'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}