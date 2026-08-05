import { create } from 'zustand';

export type Role = 'coach' | 'player' | null;

export interface PlayAssignment {
  targetId: string;
  type: string;
}

export interface Play {
  id: string;
  name: string;
  formation: string;
  type: 'Run' | 'Pass';
  status: 'installed' | 'draft' | 'locked';
  assignments: Record<string, PlayAssignment>;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  height?: number;
  weight?: number;
  positions?: string[];
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  roster: User[];
  plays: Play[];
}

interface AppState {
  user: User | null;
  team: Team | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  
  login: (name: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  createTeam: (name: string) => void;
  joinTeam: (code: string) => boolean;
  updateProfile: (profile: Partial<User>) => void;
  addPlay: (play: Play) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  team: null,
  isAuthenticated: false,
  isOnboarded: false,

  login: (name) => set({ 
    user: { id: Math.random().toString(36).substr(2, 9), name, role: null }, 
    isAuthenticated: true,
    isOnboarded: false
  }),
  
  logout: () => set({ user: null, team: null, isAuthenticated: false, isOnboarded: false }),
  
  setRole: (role) => set((state) => ({ 
    user: state.user ? { ...state.user, role } : null 
  })),
  
  createTeam: (name) => set((state) => {
    const newTeam: Team = {
      id: 'team_1',
      name,
      inviteCode: 'MEHS-12345',
      roster: state.user ? [state.user] : [],
      plays: [
        { id: '1', name: 'Inside Zone Right', formation: 'Doubles', type: 'Run', status: 'installed', assignments: {}, notes: 'Standard inside zone rules. Double team 1-tech to backside backer.' }
      ]
    };
    return { team: newTeam, isOnboarded: true };
  }),
  
  joinTeam: (code) => {
    let success = false;
    set((state) => {
      if (code === 'MEHS-12345') {
        const mockTeam: Team = {
          id: 'team_1',
          name: 'MEHS Varsity',
          inviteCode: code,
          roster: state.user ? [{ id: 'coach_1', name: 'Coach Smith', role: 'coach' }, state.user] : [],
          plays: [
            { id: '1', name: 'Inside Zone Right', formation: 'Doubles', type: 'Run', status: 'installed', assignments: {}, notes: 'Standard inside zone rules.' }
          ]
        };
        success = true;
        return { team: mockTeam, isOnboarded: true };
      }
      return state;
    });
    return success;
  },
  
  updateProfile: (profile) => set((state) => ({
    user: state.user ? { ...state.user, ...profile } : null,
    isOnboarded: true
  })),

  addPlay: (play) => set((state) => ({
    team: state.team ? { ...state.team, plays: [...state.team.plays, play] } : null
  }))
}));
