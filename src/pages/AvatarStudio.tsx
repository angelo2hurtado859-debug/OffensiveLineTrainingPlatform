import React, { useEffect, useState } from 'react';
import { Award, Check, Flame, LockKeyhole, Save, Sparkles, Star, Zap } from 'lucide-react';
import { Button, Card } from '../components/ui';
import PlayerAvatar from '../components/PlayerAvatar';
import { useStore } from '../store';
import { achievementCatalog, defaultGameProfile, levelForXP, loadGameProfile, saveGameProfile, xpWithinLevel, type GameProfile, type PlayerAvatar as AvatarType } from '../lib/rewards';

const SKIN_TONES = ['#F1C7A5', '#D9A078', '#B77950', '#8D573A', '#633B2A', '#38251E'];
const TEAM_COLORS = [
  { label: 'Royal Blue', value: '#173F8A' },
  { label: 'Gold', value: '#C5A059' },
  { label: 'Black', value: '#151923' },
  { label: 'White', value: '#F8FAFC' },
  { label: 'Red', value: '#B91C1C' },
  { label: 'Green', value: '#166534' },
  { label: 'Purple', value: '#6D28D9' },
  { label: 'Teal', value: '#0F766E' },
];

export default function AvatarStudio() {
  const { user, team } = useStore();
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) return;
    loadGameProfile(user.id, user.name, team?.id || null)
      .then(value => { if (active) setProfile(value); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, user?.name, team?.id]);

  const updateAvatar = (patch: Partial<AvatarType>) => {
    setProfile(current => current ? { ...current, avatar: { ...current.avatar, ...patch } } : current);
    setNotice('');
  };

  const saveAvatar = async () => {
    if (!profile) return;
    setSaving(true);
    const saved = await saveGameProfile({ ...profile, userName: user?.name || profile.userName, teamId: team?.id || null });
    setSaving(false);
    setNotice(saved ? 'Avatar saved to your account.' : 'Avatar saved on this device. Shared cloud saving is not configured yet.');
  };

  if (loading || !profile) return <div className="py-12 text-center text-sm text-muted-foreground">{loading ? 'Loading your player profile…' : 'Sign in to customize your avatar.'}</div>;

  const level = levelForXP(profile.xp);
  const progress = xpWithinLevel(profile.xp);

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Player identity</p><h1 className="text-3xl font-display font-bold">Avatar Studio</h1><p className="mt-1 text-sm text-muted-foreground">Build your character. Earn XP and unlock achievements through real training.</p></div>
      <Button onClick={saveAvatar} disabled={saving}><Save size={16} className="mr-2" />{saving ? 'Saving…' : 'Save Avatar'}</Button>
    </div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Card className="relative overflow-hidden p-5 sm:p-7">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-secondary/35 p-5">
          <div className="mb-3 flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary"><Sparkles size={14} /> Player card</div>
          <PlayerAvatar avatar={profile.avatar} size={170} />
          <h2 className="mt-2 text-2xl font-display font-bold">{user?.name || profile.userName}</h2>
          <p className="text-sm text-muted-foreground">{team?.name || 'Unassigned team'} · #{profile.avatar.jerseyNumber}</p>
          <div className="mt-4 grid w-full grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-background/70 p-3 text-center"><Zap size={16} className="mx-auto mb-1 text-primary" /><p className="font-mono text-xl font-bold">{profile.xp}</p><p className="text-[10px] uppercase text-muted-foreground">XP</p></div>
            <div className="rounded-lg border border-border bg-background/70 p-3 text-center"><Star size={16} className="mx-auto mb-1 text-primary" /><p className="font-mono text-xl font-bold">{level}</p><p className="text-[10px] uppercase text-muted-foreground">Level</p></div>
            <div className="rounded-lg border border-border bg-background/70 p-3 text-center"><Flame size={16} className="mx-auto mb-1 text-orange-400" /><p className="font-mono text-xl font-bold">{profile.streak}</p><p className="text-[10px] uppercase text-muted-foreground">Day streak</p></div>
          </div>
          <div className="mt-4 w-full"><div className="mb-1 flex justify-between text-xs"><span>Level {level} progress</span><span>{progress}/250 XP</span></div><div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(progress / 250) * 100}%` }} /></div></div>
        </div>
      </Card>

      <Card className="space-y-5 p-5 sm:p-7">
        <section><h2 className="mb-3 font-display text-lg font-bold">Appearance</h2><p className="mb-2 text-xs text-muted-foreground">Skin tone</p><div className="flex flex-wrap gap-2">{SKIN_TONES.map(color => <button key={color} aria-label={`Skin tone ${color}`} onClick={() => updateAvatar({ skinTone: color })} className={`h-9 w-9 rounded-full border-2 ${profile.avatar.skinTone === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`} style={{ backgroundColor: color }} />)}</div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm">Hair style<select value={profile.avatar.hairStyle} onChange={e => updateAvatar({ hairStyle: e.target.value as AvatarType['hairStyle'] })} className="mt-1 w-full rounded-md border border-border bg-background p-2"><option value="short">Short</option><option value="curly">Curly</option><option value="long">Long</option><option value="bald">Bald</option></select></label><label className="text-sm">Jersey number<input aria-label="Jersey number" type="number" min="0" max="99" value={profile.avatar.jerseyNumber} onChange={e => updateAvatar({ jerseyNumber: String(Math.max(0, Math.min(99, Number(e.target.value || 0)))) })} className="mt-1 w-full rounded-md border border-border bg-background p-2" /></label></div>
        </section>
        <section><h2 className="mb-3 font-display text-lg font-bold">Uniform & equipment</h2><div className="space-y-4"><ColorChoice title="Jersey color" value={profile.avatar.jerseyColor} onChange={value => updateAvatar({ jerseyColor: value })} /><ColorChoice title="Helmet color" value={profile.avatar.helmetColor} onChange={value => updateAvatar({ helmetColor: value })} /><ColorChoice title="Facemask" value={profile.avatar.facemaskColor} onChange={value => updateAvatar({ facemaskColor: value })} /><ColorChoice title="Cleats" value={profile.avatar.cleatsColor} onChange={value => updateAvatar({ cleatsColor: value })} /></div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-sm">Visor<select value={profile.avatar.visor} onChange={e => updateAvatar({ visor: e.target.value as AvatarType['visor'] })} className="mt-1 w-full rounded-md border border-border bg-background p-2"><option value="clear">Clear</option><option value="smoke">Smoke</option><option value="gold">Gold</option></select></label><label className="text-sm">Accessory<select value={profile.avatar.accessory} onChange={e => updateAvatar({ accessory: e.target.value as AvatarType['accessory'] })} className="mt-1 w-full rounded-md border border-border bg-background p-2"><option value="none">None</option><option value="captain">Captain patch</option><option value="chain">Gold chain</option><option value="headband">Headband</option></select></label></div>
        </section>
        {notice && <p role="status" className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">{notice}</p>}
      </Card>
    </div>

    <Card className="p-5 sm:p-7"><div className="mb-4 flex items-center gap-2"><Award className="text-primary" /><div><h2 className="font-display text-xl font-bold">Achievements</h2><p className="text-sm text-muted-foreground">Earned through practice, not purchases.</p></div></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{achievementCatalog().map(item => {const earned = profile.achievements.includes(item.id);return <div key={item.id} className={`flex gap-3 rounded-lg border p-3 ${earned ? 'border-primary/50 bg-primary/10' : 'border-border bg-secondary/20 opacity-75'}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">{earned ? <Award className="text-primary" /> : <LockKeyhole className="text-muted-foreground" />}</div><div><p className="font-semibold">{item.title} {earned && <Check size={14} className="inline text-primary" />}</p><p className="text-xs text-muted-foreground">{item.description}</p></div></div>})}</div></Card>
  </div>;
}

function ColorChoice({ title, value, onChange }: { title: string; value: string; onChange: (value: string) => void }) {
  return <div><p className="mb-2 text-sm">{title}</p><div className="flex flex-wrap gap-2">{TEAM_COLORS.map(color => <button key={color.value} title={color.label} aria-label={color.label} onClick={() => onChange(color.value)} className={`h-7 w-7 rounded-full border-2 ${value === color.value ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`} style={{ backgroundColor: color.value }} />)}</div></div>;
}
