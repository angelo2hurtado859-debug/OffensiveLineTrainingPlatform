import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock3, Target } from 'lucide-react';
import { Card } from '../components/ui';
import { useStore } from '../store';
import { fetchPracticeAttempts, type PracticeAttempt } from '../lib/progress';

export default function Progress() {
  const { user, team } = useStore();
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPracticeAttempts({ userId: user?.id }).then(rows => {
      if (active) setAttempts(rows);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [user?.id]);

  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0;
  const best = attempts.length ? Math.max(...attempts.map(item => item.score)) : 0;
  const passed = attempts.filter(item => item.score >= 80).length;

  return <div className="space-y-6">
    <div><p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Player development</p><h1 className="text-3xl font-display font-bold">Progress Tracking</h1><p className="mt-1 text-muted-foreground">Your recorded install and quiz reps for {team?.name || 'your team'}.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Metric title="Attempts" value={attempts.length} icon={Activity} />
      <Metric title="Average score" value={attempts.length ? `${average}%` : '—'} icon={Target} />
      <Metric title="Best score" value={attempts.length ? `${best}%` : '—'} icon={CheckCircle2} />
    </div>
    <Card className="p-5"><h2 className="font-display text-xl font-bold mb-1">Rep history</h2><p className="text-sm text-muted-foreground mb-4">{passed} reps at 80% or higher.</p>
      {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading progress…</p> : attempts.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">No reps recorded yet. Complete an Install Training rep or Quiz Mode attempt to start tracking progress.</p> : <div className="space-y-2">{attempts.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-border bg-secondary/30 p-3"><div><p className="font-semibold">{item.playName}</p><p className="text-xs text-muted-foreground">{item.mode === 'quiz' ? 'Quiz Mode' : 'Install Training'} · {new Date(item.completedAt).toLocaleString()}</p></div><div className="text-right"><p className="font-mono text-lg font-bold text-primary">{item.score}%</p><p className="text-xs text-muted-foreground">{item.correct}/{item.total} correct</p></div></div>)}</div>}
    </Card>
    <p className="text-xs text-muted-foreground flex items-center gap-2"><Clock3 size={14} /> Progress syncs between devices when the Supabase practice_attempts table and access policies have been installed; otherwise this page shows this browser’s saved records.</p>
  </div>;
}

function Metric({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return <Card className="p-5 flex items-center gap-4"><div className="rounded-lg bg-secondary p-3 text-primary"><Icon size={22} /></div><div><p className="text-sm text-muted-foreground">{title}</p><p className="font-mono text-2xl font-bold">{value}</p></div></Card>;
}
