-- Shared player XP, streaks, achievements, and customizable avatars for OLA.
-- Apply in the Supabase SQL Editor if your deployment does not auto-run migrations.

create table if not exists public.player_game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_name text not null,
  team_id uuid references public.teams(id) on delete set null,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_study_date date,
  avatar jsonb not null default '{}'::jsonb,
  achievements text[] not null default '{}',
  recent_attempt_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists player_game_profiles_team_xp_idx
  on public.player_game_profiles (team_id, xp desc);

alter table public.player_game_profiles enable row level security;

drop policy if exists "Players can read their own game profile" on public.player_game_profiles;
create policy "Players can read their own game profile"
  on public.player_game_profiles for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = player_game_profiles.team_id
        and tm.user_id = auth.uid()
    )
  );

drop policy if exists "Players can create their own game profile" on public.player_game_profiles;
create policy "Players can create their own game profile"
  on public.player_game_profiles for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Players can update their own game profile" on public.player_game_profiles;
create policy "Players can update their own game profile"
  on public.player_game_profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
