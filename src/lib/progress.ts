import { supabase } from './supabase';

export type PracticeMode = 'training' | 'quiz';

export interface PracticeAttempt {
  id: string;
  userId: string;
  userName: string;
  teamId: string | null;
  playId: string;
  playName: string;
  mode: PracticeMode;
  correct: number;
  total: number;
  score: number;
  completedAt: string;
}

const STORAGE_KEY = 'mehs-ol-practice-attempts';

export function getPracticeAttempts(): PracticeAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeLocalAttempt(attempt: PracticeAttempt): void {
  const attempts = getPracticeAttempts();
  const withoutDuplicate = attempts.filter(item => item.id !== attempt.id);
  withoutDuplicate.push(attempt);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutDuplicate));
}

export async function savePracticeAttempt(attempt: PracticeAttempt): Promise<void> {
  storeLocalAttempt(attempt);
  try {
    const { error } = await supabase.from('practice_attempts').insert({
      id: attempt.id,
      user_id: attempt.userId,
      user_name: attempt.userName,
      team_id: attempt.teamId,
      play_id: attempt.playId,
      play_name: attempt.playName,
      mode: attempt.mode,
      correct: attempt.correct,
      total: attempt.total,
      score: attempt.score,
      completed_at: attempt.completedAt,
    });
    // A missing table or RLS policy should not erase a player's local record.
    if (error) console.warn('Practice attempt remains local; shared progress is unavailable.', error.message);
  } catch (error) {
    console.warn('Practice attempt remains local; shared progress is unavailable.', error);
  }
}

function fromDatabase(row: any): PracticeAttempt {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    teamId: row.team_id || null,
    playId: row.play_id,
    playName: row.play_name,
    mode: row.mode,
    correct: row.correct,
    total: row.total,
    score: row.score,
    completedAt: row.completed_at,
  };
}

export async function fetchPracticeAttempts(filters: { teamId?: string | null; userId?: string | null } = {}): Promise<PracticeAttempt[]> {
  let query = supabase.from('practice_attempts').select('*').order('completed_at', { ascending: false });
  if (filters.teamId) query = query.eq('team_id', filters.teamId);
  else if (filters.userId) query = query.eq('user_id', filters.userId);

  try {
    const { data, error } = await query;
    if (error) throw error;
    const combined = new Map<string, PracticeAttempt>();
    for (const item of getPracticeAttempts()) {
      if (filters.teamId && item.teamId !== filters.teamId) continue;
      if (filters.userId && item.userId !== filters.userId) continue;
      combined.set(item.id, item);
    }
    for (const row of data || []) combined.set(row.id, fromDatabase(row));
    return [...combined.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  } catch (error) {
    console.warn('Shared practice progress is unavailable; showing this browser’s records.', error);
    return getPracticeAttempts()
      .filter(item => !filters.teamId || item.teamId === filters.teamId)
      .filter(item => !filters.userId || item.userId === filters.userId)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }
}
