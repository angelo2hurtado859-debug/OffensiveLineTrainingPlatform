import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Role = 'coach' | 'player' | null;

export interface User {
  id: string;
  name: string;
  role: Role;
  height?: number;
  weight?: number;
  positions?: string[];
}

export interface Play {
  id: string;
  name: string;
  formation: string;
  type: 'Run' | 'Pass';
  status: 'installed' | 'draft' | 'locked';
  assignments: Record<string, any>;
  notes: string;
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

  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  joinTeam: (code: string) => Promise<boolean>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  addPlay: (play: Play) => Promise<void>;
}

async function loadTeam(teamId: string): Promise<Team | null> {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (teamError || !team) {
    throw teamError || new Error('Team not found');
  }

  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', teamId);

  if (membersError) {
    throw membersError;
  }

  const ids = members?.map(member => member.user_id) || [];

  let roster: User[] = [];

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ids);

    if (error) {
      throw error;
    }

    roster = data || [];
  }

  const { data: plays, error: playsError } = await supabase
    .from('plays')
    .select('*')
    .eq('team_id', teamId);

  if (playsError) {
    throw playsError;
  }

  return {
    id: team.id,
    name: team.name,
    inviteCode: team.invite_code,
    roster,
    plays: (plays || []).map((play: any) => ({
      ...play,
      status: play.status || 'draft',
      assignments: play.assignments || {},
    })),
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      team: null,
      isAuthenticated: false,
      isOnboarded: false,

      signup: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error || !data.user) {
          throw error || new Error('Could not create account');
        }

        const user: User = {
          id: data.user.id,
          name,
          role: null,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(user);

        if (profileError) {
          throw profileError;
        }

        set({
          user,
          team: null,
          isAuthenticated: true,
          isOnboarded: false,
        });
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          throw error || new Error('Invalid login credentials');
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          throw profileError || new Error('Profile missing');
        }

        let team: Team | null = null;

        /*
         * Coaches are connected to their team through teams.coach_id.
         * This means the same logic works for every coach and every team.
         */
        if (profile.role === 'coach') {
          const { data: coachTeam, error: coachTeamError } = await supabase
            .from('teams')
            .select('id')
            .eq('coach_id', data.user.id)
            .maybeSingle();

          if (coachTeamError) {
            throw coachTeamError;
          }

          if (coachTeam?.id) {
            team = await loadTeam(coachTeam.id);
          }
        }

        /*
         * Players are connected to their team through team_members.
         */
        if (profile.role === 'player' && !team) {
          const { data: membership, error: membershipError } =
            await supabase
              .from('team_members')
              .select('team_id')
              .eq('user_id', data.user.id)
              .limit(1)
              .maybeSingle();

          if (membershipError) {
            throw membershipError;
          }

          if (membership?.team_id) {
            team = await loadTeam(membership.team_id);
          }
        }

        set({
          user: profile,
          team,
          isAuthenticated: true,
          isOnboarded: !!team,
        });
      },

      logout: async () => {
        await supabase.auth.signOut();

        set({
          user: null,
          team: null,
          isAuthenticated: false,
          isOnboarded: false,
        });
      },

      resetPassword: async email => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });

        if (error) {
          throw error;
        }
      },

      updatePassword: async password => {
        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) {
          throw error;
        }
      },

      setRole: async role => {
        const user = get().user;

        if (!user) {
          throw new Error('Not authenticated');
        }

        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        set({
          user: {
            ...user,
            role,
          },
        });
      },

      createTeam: async name => {
        const user = get().user;

        if (!user) {
          throw new Error('Not authenticated');
        }

        /*
         * Prevent a returning coach from accidentally creating
         * another team.
         */
        const { data: existingTeam, error: existingTeamError } =
          await supabase
            .from('teams')
            .select('id')
            .eq('coach_id', user.id)
            .maybeSingle();

        if (existingTeamError) {
          throw existingTeamError;
        }

        if (existingTeam?.id) {
          const existingTeamData = await loadTeam(existingTeam.id);

          set({
            team: existingTeamData,
            isOnboarded: true,
          });

          return;
        }

        const code = `MEHS-${Math.floor(
          10000 + Math.random() * 90000
        )}`;

        const { data, error } = await supabase
          .from('teams')
          .insert({
            name,
            invite_code: code,
            coach_id: user.id,
          })
          .select()
          .single();

        if (error || !data) {
          throw error || new Error('Could not create team');
        }

        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: data.id,
            user_id: user.id,
          });

        if (memberError) {
          throw memberError;
        }

        const team = await loadTeam(data.id);

        set({
          team,
          isOnboarded: true,
        });
      },

      joinTeam: async code => {
        const user = get().user;

        if (!user) {
          return false;
        }

        const cleanCode = code.trim().toUpperCase();

        const { data: team, error } = await supabase
          .from('teams')
          .select('*')
          .eq('invite_code', cleanCode)
          .maybeSingle();

        if (error || !team) {
          return false;
        }

        const { data: existingMembership, error: membershipError } =
          await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        if (existingMembership?.team_id) {
          return false;
        }

        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: user.id,
          });

        if (memberError) {
          return false;
        }

        const fullTeam = await loadTeam(team.id);

        set({
          team: fullTeam,
          isOnboarded: true,
        });

        return true;
      },

      addPlay: async play => {
        const { user, team } = get();

        if (!user) throw new Error('You must be logged in to save a play.');
        if (!team) throw new Error('Join or create a team before saving plays.');
        if (user.role !== 'coach') throw new Error('Only coaches can save plays.');

        const { data, error } = await supabase
          .from('plays')
          .insert({
            team_id: team.id,
            name: play.name,
            formation: play.formation,
            type: play.type,
            assignments: play.assignments || {},
            notes: play.notes || '',
          })
          .select()
          .single();

        if (error) throw error;

        const savedPlay: Play = {
          id: data.id,
          name: data.name,
          formation: data.formation,
          type: data.type,
          status: 'draft',
          assignments: data.assignments || {},
          notes: data.notes || '',
        };

        set(state => {
          if (!state.team || state.team.id !== team.id) return {};
          return {
            team: {
              ...state.team,
              plays: [...state.team.plays, savedPlay],
            },
          };
        });
      },

      updateProfile: async profile => {
        const user = get().user;

        if (!user) {
          throw new Error('Not authenticated');
        }

        const { error } = await supabase
          .from('profiles')
          .update(profile)
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        set({
          user: {
            ...user,
            ...profile,
          },
        });
      },
    }),
    {
      name: 'mehs-ol-storage',
    }
  )
);