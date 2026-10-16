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

export function savePracticeAttempt(attempt: PracticeAttempt): void {
  const attempts = getPracticeAttempts();
  attempts.push(attempt);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}
