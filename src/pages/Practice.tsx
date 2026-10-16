import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, CheckCircle2, ClipboardCheck, RotateCcw, Target } from 'lucide-react';
import { Button, Card } from '../components/ui';
import SimulatorCanvas from '../components/simulator/SimulatorCanvas';
import { useStore, type Play } from '../store';
import { fetchPracticeAttempts, savePracticeAttempt, type PracticeMode } from '../lib/progress';
import { awardPracticeRewards } from '../lib/rewards';

type Assignment = { targetId: string; type: string };
const EMPTY_ASSIGNMENTS: Record<string, Assignment> = {};
const LINE_POSITIONS = ['LT', 'LG', 'C', 'RG', 'RT'];

export default function Practice({ mode }: { mode: PracticeMode }) {
  const { user, team } = useStore();
  const navigate = useNavigate();
  const plays = useMemo(() => (team?.plays || []).filter(play => play.status !== 'locked'), [team?.plays]);
  const [selectedPlayId, setSelectedPlayId] = useState(plays[0]?.id || '');
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(EMPTY_ASSIGNMENTS);
  const [feedback, setFeedback] = useState<{ correct: number; total: number; score: number } | null>(null);
  const [error, setError] = useState('');
  const [weakestPlayId, setWeakestPlayId] = useState('');
  const [rewardNotice, setRewardNotice] = useState('');

  useEffect(() => {
    let active = true;
    if (!user || plays.length === 0) return;
    fetchPracticeAttempts({ userId: user.id }).then(attempts => {
      if (!active) return;
      const grouped = new Map<string, { total: number; count: number }>();
      attempts.forEach(attempt => {
        const row = grouped.get(attempt.playId) || { total: 0, count: 0 };
        row.total += attempt.score;
        row.count += 1;
        grouped.set(attempt.playId, row);
      });
      const weakest = [...grouped.entries()].map(([id, row]) => ({ id, average: row.total / row.count }))
        .filter(row => plays.some(play => play.id === row.id))
        .sort((a, b) => a.average - b.average)[0];
      if (weakest) {
        setWeakestPlayId(weakest.id);
        if (weakest.average < 80) setSelectedPlayId(weakest.id);
      }
    });
    return () => { active = false; };
  }, [user?.id, team?.id, plays.length]);

  const selectedPlay: Play | undefined = plays.find(play => play.id === selectedPlayId);
  const answerKey = (selectedPlay?.assignments || {}) as Record<string, Assignment>;
  const requiredKeys = Object.keys(answerKey).filter(key => answerKey[key]?.targetId && answerKey[key]?.type);

  const choosePlay = (id: string) => {
    setSelectedPlayId(id);
    setAssignments(EMPTY_ASSIGNMENTS);
    setFeedback(null);
    setError('');
    setRewardNotice('');
  };

  const checkRep = () => {
    setError('');
    if (!selectedPlay) {
      setError('Choose a play to begin.');
      return;
    }
    if (requiredKeys.length === 0) {
      setError('This play has no saved answer key yet. Ask your coach to open it in Playbook, set assignments, and save it.');
      return;
    }
    const correct = requiredKeys.filter(key =>
      assignments[key]?.targetId === answerKey[key]?.targetId &&
      assignments[key]?.type === answerKey[key]?.type
    ).length;
    const total = requiredKeys.length;
    const score = Math.round((correct / total) * 100);
    setFeedback({ correct, total, score });
    if (user) {
      const attemptId = crypto.randomUUID();
      void savePracticeAttempt({
        id: attemptId,
        userId: user.id,
        userName: user.name,
        teamId: team?.id || null,
        playId: selectedPlay.id,
        playName: selectedPlay.name,
        mode,
        correct,
        total,
        score,
        completedAt: new Date().toISOString(),
      });
      const xp = 20 + (score >= 60 ? 10 : 0) + (score >= 80 ? 20 : 0) + (score === 100 ? 20 : 0);
      void awardPracticeRewards({ userId: user.id, userName: user.name, teamId: team?.id || null, attemptId, score })
        .then(() => setRewardNotice('+' + xp + ' XP earned. Keep building your streak and unlock achievements in Avatar Studio.'));
    }
  };

  const resetRep = () => {
    setAssignments(EMPTY_ASSIGNMENTS);
    setFeedback(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">{mode === 'quiz' ? 'Evaluation' : 'Film room'}</p>
          <h1 className="text-3xl font-display font-bold">{mode === 'quiz' ? 'Quiz Mode' : 'Install Training'}</h1>
          <p className="mt-1 text-muted-foreground">{mode === 'quiz' ? 'Set your assignments from memory, then check them against the coach’s key.' : 'Practice the blocking rules on the field, then review your result.'}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/playbook')}><BookOpen size={16} className="mr-2" /> Playbook</Button>
      </div>

      {plays.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <Target size={34} className="mx-auto text-primary" />
          <h2 className="text-xl font-display font-bold">No available plays</h2>
          <p className="text-sm text-muted-foreground">Your team needs a saved play before you can practice.</p>
          <Button onClick={() => navigate('/playbook')}>Open Playbook</Button>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <label className="block text-sm font-semibold mb-2" htmlFor="practice-play">Choose a play</label>
            <select id="practice-play" value={selectedPlayId} onChange={event => choosePlay(event.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              {plays.map(play => <option key={play.id} value={play.id}>{play.name} · {play.type || 'Run'}</option>)}
            </select>
            {selectedPlay?.notes && <p className="mt-3 text-sm text-muted-foreground">{selectedPlay.notes}</p>}
          </Card>

          {weakestPlayId && selectedPlayId === weakestPlayId && <Card className="border-primary/40 bg-primary/5 p-4"><p className="font-display text-lg font-bold text-primary">Weakness-based review</p><p className="text-sm text-muted-foreground">This is currently your lowest-scoring play based on saved attempts. Repeat the assignment check and aim for 80% or higher.</p></Card>}

          {mode === 'training' && requiredKeys.length > 0 && (
            <Card className="p-4">
              <h2 className="font-display text-lg font-bold mb-2">Coach’s install points</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {requiredKeys.map(key => <div key={key} className="rounded border border-border bg-secondary/40 px-3 py-2 text-sm"><span className="font-bold text-primary">{key}</span><span className="text-muted-foreground"> → {answerKey[key].targetId}</span><div className="text-xs text-muted-foreground">{answerKey[key].type}</div></div>)}
              </div>
            </Card>
          )}

          <div className="min-h-[420px]">
            <SimulatorCanvas key={selectedPlayId + mode} initialAssignments={EMPTY_ASSIGNMENTS} onAssignmentsChange={setAssignments} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={checkRep}><ClipboardCheck size={16} className="mr-2" /> {mode === 'quiz' ? 'Check Answers' : 'Complete Training Rep'}</Button>
            <Button variant="outline" onClick={resetRep}><RotateCcw size={16} className="mr-2" /> Reset Rep</Button>
          </div>

          {error && <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          {rewardNotice && <p role="status" className="rounded border border-primary/40 bg-primary/10 p-3 text-sm text-primary">{rewardNotice}</p>}
          {feedback && (
            <Card className="p-5 border-primary/40">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={28} className={feedback.score >= 80 ? 'text-primary' : 'text-amber-400'} />
                <div><p className="text-xl font-display font-bold">{feedback.score}% — {feedback.score >= 80 ? 'Assignment check passed' : 'Review and rep again'}</p><p className="text-sm text-muted-foreground">{feedback.correct} of {feedback.total} saved assignments matched the coach’s key.</p></div>
              </div>
              <div className="mt-4 space-y-2">
                {requiredKeys.map(key => {
                  const ok = assignments[key]?.targetId === answerKey[key]?.targetId && assignments[key]?.type === answerKey[key]?.type;
                  return <div key={key} className="flex items-center justify-between rounded bg-secondary/40 px-3 py-2 text-sm"><span>{key}: {assignments[key]?.targetId ? `${assignments[key].targetId} · ${assignments[key].type}` : 'No assignment'}</span><span className={ok ? 'text-primary' : 'text-red-300'}>{ok ? 'Correct' : `Key: ${answerKey[key].targetId} · ${answerKey[key].type}`}</span></div>;
                })}
              </div>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">Available line positions: {LINE_POSITIONS.join(' · ')}. Results currently save in this browser; cross-device team reporting requires a shared progress table in Supabase.</p>
        </>
      )}
    </div>
  );
}
