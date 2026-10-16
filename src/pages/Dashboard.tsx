import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store';
import { Card, Button } from '../components/ui';
import { Users, BookOpen, Target, Trophy, Share2, Activity, CircleHelp } from 'lucide-react';
import { fetchPracticeAttempts, type PracticeAttempt } from '../lib/progress';

export default function Dashboard() {
  const { user, team } = useStore();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    let active = true;
    setLoadingActivity(true);
    fetchPracticeAttempts({ teamId: team?.id }).then(rows => {
      if (active) setAttempts(rows);
    }).finally(() => {
      if (active) setLoadingActivity(false);
    });
    return () => { active = false; };
  }, [team?.id]);

  const averageAccuracy = attempts.length
    ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length)
    : null;

  const playerAverages = useMemo(() => {
    const grouped = new Map<string, { score: number; count: number }>();
    attempts.forEach(item => {
      const current = grouped.get(item.userId) || { score: 0, count: 0 };
      current.score += item.score;
      current.count += 1;
      grouped.set(item.userId, current);
    });
    return [...grouped.entries()]
      .map(([id, value]) => ({ id, average: Math.round(value.score / value.count), count: value.count }))
      .sort((a, b) => b.average - a.average || b.count - a.count);
  }, [attempts]);

  const myAttempts = attempts.filter(item => item.userId === user?.id);
  const masteredPlays = new Set(myAttempts.filter(item => item.score >= 80).map(item => item.playId)).size;
  const myAverage = myAttempts.length ? Math.round(myAttempts.reduce((sum, item) => sum + item.score, 0) / myAttempts.length) : null;
  const rank = playerAverages.findIndex(item => item.id === user?.id) + 1;
  const playerRoster = (team?.roster || []).filter(player => player.role !== 'coach');

  const invitePlayers = async () => {
    if (!team?.inviteCode) return;
    const text = `Join ${team.name} on OLA using team code: ${team.inviteCode}`;
    try {
      await navigator.clipboard.writeText(text);
      window.alert('Team invite copied to clipboard.');
    } catch {
      window.prompt('Copy this team invite:', text);
    }
  };

  if (user?.role === 'coach') {
    const installed = (team?.plays || []).filter(play => play.status === 'installed').length;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div><h1 className="text-3xl font-display font-bold">Coach Dashboard</h1><p className="text-muted-foreground mt-1">Manage {team?.name || 'your team'}.</p></div>
          <div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" onClick={() => navigate('/about')} aria-label="Help, shortcuts, and creator story" title="Help, shortcuts, and creator story"><CircleHelp size={18}/><span className="ml-2">Help</span></Button>{team?.inviteCode && <Button variant="outline" className="space-x-2" onClick={invitePlayers}><Share2 size={16} /><span>Invite Players · {team.inviteCode}</span></Button>}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Players" value={playerRoster.length} icon={Users} />
          <StatCard title="Plays Installed" value={installed} icon={BookOpen} />
          <StatCard title="Avg Rep Score" value={averageAccuracy === null ? '—' : `${averageAccuracy}%`} icon={Target} />
          <StatCard title="Recorded Reps" value={attempts.length} icon={Activity} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">Team Roster</h2><Button size="sm" variant="outline" onClick={() => navigate('/rankings')}>View Rankings</Button></div>
            {playerRoster.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No players have joined this team yet. Share the invite code to get started.</p> : <div className="space-y-3">{playerRoster.map(player => {
              const stat = playerAverages.find(item => item.id === player.id);
              return <div key={player.id} className="flex items-center justify-between gap-3 rounded border border-border/50 bg-secondary/30 p-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold">{player.name.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{player.name}</p><p className="text-xs text-muted-foreground">{player.positions?.length ? player.positions.join(', ') : 'Positions not set'}</p></div></div><div className="text-right"><p className="font-mono text-sm text-primary">{stat ? `${stat.average}%` : '—'}</p><p className="text-xs text-muted-foreground">{stat ? `${stat.count} reps` : 'No reps yet'}</p></div></div>;
            })}</div>}
          </Card>
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">Recent Practice</h2><Button size="sm" variant="outline" onClick={() => navigate('/progress')}>Progress</Button></div>
            {loadingActivity ? <p className="text-sm text-muted-foreground">Loading activity…</p> : attempts.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Practice attempts will appear here once players complete training or quizzes.</p> : <div className="space-y-3">{attempts.slice(0, 6).map(item => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0"><div><p className="text-sm font-semibold">{item.userName} · {item.playName}</p><p className="text-xs text-muted-foreground">{item.mode === 'quiz' ? 'Quiz Mode' : 'Install Training'} · {new Date(item.completedAt).toLocaleString()}</p></div><p className="font-mono font-bold text-primary">{item.score}%</p></div>)}</div>}
          </Card>
        </div>
      </div>
    );
  }

  const nextPlay = (team?.plays || []).find(play => play.status !== 'locked' && !myAttempts.some(attempt => attempt.playId === play.id && attempt.score >= 80)) || (team?.plays || []).find(play => play.status !== 'locked');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3"><div><h1 className="text-3xl font-display font-bold">Welcome back, {user?.name}</h1><p className="mt-1 text-muted-foreground">{team?.name || 'No Team Assigned'}{user?.positions?.length ? ` · ${user.positions.join(', ')}` : ''}</p></div><Button variant="outline" size="sm" onClick={() => navigate('/about')} aria-label="Help, shortcuts, and creator story" title="Help, shortcuts, and creator story"><CircleHelp size={18}/><span className="ml-2">Help</span></Button></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Recorded Reps" value={myAttempts.length} icon={Activity} />
        <StatCard title="Plays Mastered" value={`${masteredPlays}/${(team?.plays || []).filter(play => play.status !== 'locked').length}`} icon={BookOpen} />
        <StatCard title="My Accuracy" value={myAverage === null ? '—' : `${myAverage}%`} icon={Target} />
        <StatCard title="Team Rank" value={rank ? `#${rank}` : '—'} icon={Trophy} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-primary/30 bg-primary/5">
          <h2 className="mb-2 font-display text-xl font-bold text-primary">Recommended Next Rep</h2>
          {nextPlay ? <><p className="mb-1 font-semibold">{nextPlay.name}</p><p className="mb-4 text-sm text-muted-foreground">{nextPlay.notes || 'Review your assignment rules and get your reps in.'}</p><div className="flex flex-wrap gap-2"><Button onClick={() => navigate('/training')}>Start Training</Button><Button variant="outline" onClick={() => navigate('/quiz')}>Quiz Yourself</Button></div></> : <><p className="mb-4 text-sm text-muted-foreground">Your coach has not added a play yet.</p><Button variant="outline" onClick={() => navigate('/playbook')}>Open Playbook</Button></>}
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 font-display text-xl font-bold">Keep Improving</h2>
          <p className="mb-4 text-sm text-muted-foreground">Complete install reps, check your assignments, and revisit plays until you score at least 80%.</p>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => navigate('/progress')}>View My Progress</Button><Button variant="outline" onClick={() => navigate('/rankings')}>Team Rankings</Button></div>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">{loadingActivity ? 'Syncing your practice records…' : 'Stats are based on saved practice attempts. Shared stats require the Supabase practice_attempts table to be configured.'}</p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return <Card className="p-5 flex items-center space-x-4"><div className="p-3 bg-secondary rounded-lg text-primary"><Icon size={24} /></div><div><p className="text-sm text-muted-foreground font-medium">{title}</p><p className="text-2xl font-bold font-mono">{value}</p></div></Card>;
}
