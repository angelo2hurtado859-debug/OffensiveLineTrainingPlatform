import React, { useMemo } from 'react';
import { Trophy, Users } from 'lucide-react';
import { Card } from '../components/ui';
import { useStore } from '../store';
import { getPracticeAttempts } from '../lib/progress';

export default function Rankings() {
  const { user, team } = useStore();
  const ranking = useMemo(() => {
    const attempts = getPracticeAttempts().filter(item => item.teamId === team?.id);
    const grouped = new Map<string, { userId: string; name: string; attempts: number; totalScore: number; best: number }>();
    for (const attempt of attempts) {
      const row = grouped.get(attempt.userId) || { userId: attempt.userId, name: attempt.userName, attempts: 0, totalScore: 0, best: 0 };
      row.attempts += 1;
      row.totalScore += attempt.score;
      row.best = Math.max(row.best, attempt.score);
      grouped.set(attempt.userId, row);
    }
    return [...grouped.values()].map(row => ({ ...row, average: Math.round(row.totalScore / row.attempts) })).sort((a, b) => b.average - a.average || b.attempts - a.attempts);
  }, [team?.id]);

  return <div className="space-y-6">
    <div><p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Team accountability</p><h1 className="text-3xl font-display font-bold">Team Rankings</h1><p className="mt-1 text-muted-foreground">Ranked by average recorded assignment score.</p></div>
    <Card className="p-5"><div className="flex items-center gap-3 mb-4"><Trophy className="text-primary" size={24} /><div><h2 className="font-display text-xl font-bold">Practice leaderboard</h2><p className="text-xs text-muted-foreground">This browser’s saved sessions only</p></div></div>
      {ranking.length === 0 ? <div className="py-8 text-center"><Users size={32} className="mx-auto mb-3 text-muted-foreground" /><p className="font-semibold">No ranked reps yet</p><p className="mt-1 text-sm text-muted-foreground">Players appear after they complete a training or quiz rep on this browser.</p></div> : <div className="space-y-2">{ranking.map((row, index) => <div key={row.userId} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded border border-border bg-secondary/30 p-3"><div className={index === 0 ? 'flex h-9 w-9 items-center justify-center rounded-full bg-primary text-black font-bold' : 'flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-mono font-bold'}>{index + 1}</div><div><p className="font-semibold">{row.name}{row.userId === user?.id ? ' (you)' : ''}</p><p className="text-xs text-muted-foreground">{row.attempts} reps · best {row.best}%</p></div><p className="font-mono text-xl font-bold text-primary">{row.average}%</p></div>)}</div>}
    </Card>
    <p className="text-xs text-muted-foreground">These rankings are not yet shared between devices. Team-wide live rankings need a Supabase table for practice attempts and row-level access rules.</p>
  </div>;
}
