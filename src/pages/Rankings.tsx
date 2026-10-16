import React, { useEffect, useState } from 'react';
import { Trophy, Users } from 'lucide-react';
import { Card } from '../components/ui';
import { useStore } from '../store';
import { fetchPracticeAttempts, type PracticeAttempt } from '../lib/progress';
import { fetchTeamGameProfiles, levelForXP, type GameProfile } from '../lib/rewards';
import PlayerAvatar from '../components/PlayerAvatar';

type RankedPlayer = { userId: string; name: string; attempts: number; average: number; best: number };

export default function Rankings() {
  const { user, team } = useStore();
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameProfiles, setGameProfiles] = useState<GameProfile[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPracticeAttempts({ teamId: team?.id }).then(rows => {
      if (active) setAttempts(rows);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [team?.id]);

  useEffect(() => {
    let active = true;
    if (!team?.id) { setGameProfiles([]); return; }
    fetchTeamGameProfiles(team.id).then(profiles => { if (active) setGameProfiles(profiles); });
    return () => { active = false; };
  }, [team?.id]);

  const grouped = new Map<string, { userId: string; name: string; attempts: number; totalScore: number; best: number }>();
  for (const attempt of attempts) {
    const row = grouped.get(attempt.userId) || { userId: attempt.userId, name: attempt.userName, attempts: 0, totalScore: 0, best: 0 };
    row.attempts += 1;
    row.totalScore += attempt.score;
    row.best = Math.max(row.best, attempt.score);
    grouped.set(attempt.userId, row);
  }
  const ranking: RankedPlayer[] = [...grouped.values()]
    .map(row => ({ userId: row.userId, name: row.name, attempts: row.attempts, average: Math.round(row.totalScore / row.attempts), best: row.best }))
    .sort((a, b) => b.average - a.average || b.attempts - a.attempts);

  return <div className="space-y-6">
    <div><p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Team accountability</p><h1 className="text-3xl font-display font-bold">Team Rankings</h1><p className="mt-1 text-muted-foreground">Ranked by average recorded assignment score.</p></div>
    <Card className="p-5"><div className="mb-4 flex items-center gap-3"><Trophy className="text-primary" size={24} /><div><h2 className="font-display text-xl font-bold">XP & Avatar Leaderboard</h2><p className="text-xs text-muted-foreground">XP is earned by completing reps, passing assignment checks, and mastering concepts.</p></div></div>
      {gameProfiles.length === 0 ? <p className="py-5 text-center text-sm text-muted-foreground">Players appear here after they complete training or save an avatar. Rewards sync when the Supabase player_game_profiles migration is installed.</p> : <div className="space-y-2">{[...gameProfiles].sort((a,b) => b.xp-a.xp).map((profile,index) => <div key={profile.userId} className="grid grid-cols-[2rem_3rem_minmax(0,1fr)_auto] items-center gap-3 rounded border border-border bg-secondary/30 p-3"><div className={index === 0 ? 'flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-black' : 'flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-mono font-bold'}>{index+1}</div><div className="flex h-12 w-10 items-center justify-center overflow-hidden rounded bg-background"><PlayerAvatar avatar={profile.avatar} size={38} /></div><div className="min-w-0"><p className="truncate font-semibold">{profile.userName}{profile.userId === user?.id ? ' (you)' : ''}</p><p className="text-xs text-muted-foreground">Level {levelForXP(profile.xp)} · {profile.streak}-day streak · {profile.achievements.length} achievements</p></div><p className="font-mono text-lg font-bold text-primary">{profile.xp} XP</p></div>)}</div>}
    </Card>
    <Card className="p-5"><div className="flex items-center gap-3 mb-4"><Trophy className="text-primary" size={24} /><div><h2 className="font-display text-xl font-bold">Practice leaderboard</h2><p className="text-xs text-muted-foreground">Shared scores appear when team progress storage is configured</p></div></div>
      {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading rankings…</p> : ranking.length === 0 ? <div className="py-8 text-center"><Users size={32} className="mx-auto mb-3 text-muted-foreground" /><p className="font-semibold">No ranked reps yet</p><p className="mt-1 text-sm text-muted-foreground">Players appear after they complete a training or quiz rep.</p></div> : <div className="space-y-2">{ranking.map((row, index) => <div key={row.userId} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded border border-border bg-secondary/30 p-3"><div className={index === 0 ? 'flex h-9 w-9 items-center justify-center rounded-full bg-primary text-black font-bold' : 'flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mono font-bold'}>{index + 1}</div><div><p className="font-semibold">{row.name}{row.userId === user?.id ? ' (you)' : ''}</p><p className="text-xs text-muted-foreground">{row.attempts} reps · best {row.best}%</p></div><p className="font-mono text-xl font-bold text-primary">{row.average}%</p></div>)}</div>}
    </Card>
    <p className="text-xs text-muted-foreground">Team rankings query shared practice attempts when the Supabase table and row-level security policies are installed. If they are missing, only local records are available.</p>
  </div>;
}
