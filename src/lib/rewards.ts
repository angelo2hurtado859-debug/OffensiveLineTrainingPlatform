import { supabase } from './supabase';

export type PlayerAvatar = {
  skinTone: string;
  hairStyle: 'short' | 'curly' | 'long' | 'bald';
  helmetColor: string;
  facemaskColor: string;
  jerseyColor: string;
  jerseyNumber: string;
  visor: 'clear' | 'smoke' | 'gold';
  cleatsColor: string;
  accessory: 'none' | 'captain' | 'chain' | 'headband';
};

export type GameProfile = {
  userId: string;
  userName: string;
  teamId: string | null;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  avatar: PlayerAvatar;
  achievements: string[];
  recentAttemptIds: string[];
};

export const DEFAULT_AVATAR: PlayerAvatar = {
  skinTone: '#9A6546',
  hairStyle: 'short',
  helmetColor: '#173F8A',
  facemaskColor: '#D5B15C',
  jerseyColor: '#173F8A',
  jerseyNumber: '77',
  visor: 'clear',
  cleatsColor: '#D5B15C',
  accessory: 'none',
};

const STORAGE_KEY = 'mehs-ol-game-profiles';
const ACHIEVEMENTS = [
  { id: 'first-rep', title: 'First Rep', description: 'Complete your first training rep.' },
  { id: 'assignment-ace', title: 'Assignment Ace', description: 'Score at least 80% on a rep.' },
  { id: 'perfect-rep', title: 'Perfect Rep', description: 'Earn a 100% score.' },
  { id: 'film-room-regular', title: 'Film Room Regular', description: 'Complete 10 training reps.' },
  { id: 'three-day-streak', title: 'Three-Day Streak', description: 'Study on three consecutive days.' },
  { id: 'week-of-work', title: 'Week of Work', description: 'Study on seven consecutive days.' },
];

export function achievementCatalog() {
  return ACHIEVEMENTS;
}

export function levelForXP(xp: number) {
  return Math.floor(Math.max(0, xp) / 250) + 1;
}

export function xpWithinLevel(xp: number) {
  return Math.max(0, xp) % 250;
}

export function defaultGameProfile(userId: string, userName: string, teamId: string | null): GameProfile {
  return {
    userId,
    userName,
    teamId,
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    avatar: { ...DEFAULT_AVATAR },
    achievements: [],
    recentAttemptIds: [],
  };
}

function readLocalProfiles(): Record<string, GameProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalProfile(profile: GameProfile) {
  if (typeof window === 'undefined') return;
  try {
    const profiles = readLocalProfiles();
    profiles[profile.userId] = profile;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Private browsing or storage restrictions should not stop training.
  }
}

function fromRow(row: any, fallback: GameProfile): GameProfile {
  return {
    ...fallback,
    userName: row.user_name || fallback.userName,
    teamId: row.team_id || fallback.teamId,
    xp: Number(row.xp) || 0,
    streak: Number(row.streak) || 0,
    lastStudyDate: row.last_study_date || null,
    avatar: { ...DEFAULT_AVATAR, ...(row.avatar || {}) },
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    recentAttemptIds: Array.isArray(row.recent_attempt_ids) ? row.recent_attempt_ids : [],
  };
}

export async function loadGameProfile(userId: string, userName: string, teamId: string | null): Promise<GameProfile> {
  const local = readLocalProfiles()[userId];
  const fallback = {
    ...defaultGameProfile(userId, userName, teamId),
    ...(local || {}),
    userId,
    userName: userName || local?.userName || 'Player',
    teamId: teamId || local?.teamId || null,
    avatar: { ...DEFAULT_AVATAR, ...(local?.avatar || {}) },
  };
  try {
    const { data, error } = await supabase
      .from('player_game_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      const merged = fromRow(data, fallback);
      writeLocalProfile(merged);
      return merged;
    }
  } catch (error) {
    console.warn('Shared player rewards unavailable; using this device’s saved profile.', error);
  }
  return fallback;
}

export async function saveGameProfile(profile: GameProfile): Promise<boolean> {
  writeLocalProfile(profile);
  try {
    const { error } = await supabase.from('player_game_profiles').upsert({
      user_id: profile.userId,
      user_name: profile.userName,
      team_id: profile.teamId,
      xp: profile.xp,
      streak: profile.streak,
      last_study_date: profile.lastStudyDate,
      avatar: profile.avatar,
      achievements: profile.achievements,
      recent_attempt_ids: profile.recentAttemptIds.slice(-100),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Rewards profile saved on this device; shared storage is unavailable.', error);
    return false;
  }
}

export async function awardPracticeRewards(input: {
  userId: string;
  userName: string;
  teamId: string | null;
  attemptId: string;
  score: number;
  completedAt?: string;
}): Promise<GameProfile> {
  const current = await loadGameProfile(input.userId, input.userName, input.teamId);
  if (current.recentAttemptIds.includes(input.attemptId)) return current;

  const date = (input.completedAt ? new Date(input.completedAt) : new Date()).toISOString().slice(0, 10);
  const yesterday = new Date(date + 'T00:00:00Z');
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const streak = current.lastStudyDate === date
    ? current.streak
    : current.lastStudyDate === yesterdayKey
      ? current.streak + 1
      : 1;

  const localAttempts = Object.values(readLocalProfiles()).reduce((count, profile) => count + (profile.userId === input.userId ? profile.recentAttemptIds.length : 0), 0);
  const xpEarned = 20 + (input.score >= 60 ? 10 : 0) + (input.score >= 80 ? 20 : 0) + (input.score === 100 ? 20 : 0);
  const achievements = new Set(current.achievements);
  if (localAttempts === 0) achievements.add('first-rep');
  if (input.score >= 80) achievements.add('assignment-ace');
  if (input.score === 100) achievements.add('perfect-rep');
  if (localAttempts + 1 >= 10) achievements.add('film-room-regular');
  if (streak >= 3) achievements.add('three-day-streak');
  if (streak >= 7) achievements.add('week-of-work');

  const updated: GameProfile = {
    ...current,
    teamId: input.teamId || current.teamId,
    xp: current.xp + xpEarned,
    streak,
    lastStudyDate: date,
    achievements: [...achievements],
    recentAttemptIds: [...current.recentAttemptIds, input.attemptId].slice(-100),
  };
  await saveGameProfile(updated);
  return updated;
}

export async function fetchTeamGameProfiles(teamId: string): Promise<GameProfile[]> {
  try {
    const { data, error } = await supabase
      .from('player_game_profiles')
      .select('*')
      .eq('team_id', teamId)
      .order('xp', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => fromRow(row, defaultGameProfile(row.user_id, row.user_name || 'Player', row.team_id)));
  } catch (error) {
    console.warn('Shared team rewards unavailable; using profiles saved on this device.', error);
    return Object.values(readLocalProfiles()).filter(profile => profile.teamId === teamId);
  }
}
