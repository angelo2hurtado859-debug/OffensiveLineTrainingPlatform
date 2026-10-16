import React, { useEffect, useState } from 'react';
import { Save, UserRound } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { useStore } from '../store';

const POSITIONS = ['LT', 'LG', 'C', 'RG', 'RT', 'TE'];

export default function Profile() {
  const { user, team, updateProfile } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [height, setHeight] = useState(user?.height ? String(user.height) : '');
  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : '');
  const [positions, setPositions] = useState<string[]>(user?.positions ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setHeight(user?.height ? String(user.height) : '');
    setWeight(user?.weight ? String(user.weight) : '');
    setPositions(user?.positions ?? []);
  }, [user?.id, user?.name, user?.height, user?.weight, user?.positions]);

  const togglePosition = (position: string) => {
    setPositions(current => current.includes(position) ? current.filter(item => item !== position) : [...current, position]);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const heightValue = height.trim() ? Number(height) : undefined;
    const weightValue = weight.trim() ? Number(weight) : undefined;
    if (!name.trim()) return setError('Enter your name.');
    if (heightValue !== undefined && (!Number.isFinite(heightValue) || heightValue < 36 || heightValue > 96)) return setError('Height must be between 36 and 96 inches.');
    if (weightValue !== undefined && (!Number.isFinite(weightValue) || weightValue < 50 || weightValue > 700)) return setError('Weight must be between 50 and 700 pounds.');
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), height: heightValue, weight: weightValue, positions });
      setMessage('Profile saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return <div className="mx-auto max-w-3xl space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Player card</p><h1 className="text-3xl font-display font-bold">Personal Profile</h1><p className="mt-1 text-muted-foreground">Manage your information and offensive-line positions.</p></div>
    <Card className="p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-4">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-primary"><UserRound size={30} /></div>
        <div className="min-w-0"><h2 className="text-xl font-bold">{user.name}</h2><p className="text-sm capitalize text-muted-foreground">{user.role ?? 'Role not selected'} · {team?.name ?? 'No team connected'}</p><p className="text-xs text-muted-foreground">Account ID: {user.id.slice(0, 8)}…</p></div>
      </div>
      <form onSubmit={save} className="space-y-5">
        <div><label className="mb-2 block text-sm font-medium" htmlFor="profile-name">Name</label><Input id="profile-name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="mb-2 block text-sm font-medium" htmlFor="profile-height">Height (inches)</label><Input id="profile-height" type="number" min="36" max="96" step="1" placeholder="e.g. 70" value={height} onChange={e => setHeight(e.target.value)} /></div>
          <div><label className="mb-2 block text-sm font-medium" htmlFor="profile-weight">Weight (pounds)</label><Input id="profile-weight" type="number" min="50" max="700" step="1" placeholder="e.g. 225" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        </div>
        <div><p className="mb-2 block text-sm font-medium">Positions (select all that apply)</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{POSITIONS.map(position => <button key={position} type="button" aria-pressed={positions.includes(position)} onClick={() => togglePosition(position)} className={`rounded-md border px-3 py-3 text-sm font-bold transition-colors ${positions.includes(position) ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-background text-muted-foreground hover:border-primary/50'}`}>{position}</button>)}</div></div>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-600">{message}</p>}
        <Button type="submit" disabled={saving} className="w-full sm:w-auto"><Save size={16} className="mr-2" />{saving ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </Card>
    <p className="text-xs text-muted-foreground">Height, weight, and positions are optional. Changes are saved to your account through the app’s profile store.</p>
  </div>;
}
