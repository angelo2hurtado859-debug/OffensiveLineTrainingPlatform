-- OLA shared training and quiz history.
-- Run this in the Supabase SQL Editor for project hbchexmhizrexdsejznn
-- if migrations are not automatically applied by your deployment.

create table if not exists public.practice_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  team_id uuid references public.teams(id) on delete cascade,
  play_id uuid not null references public.plays(id) on delete cascade,
  play_name text not null,
  mode text not null check (mode in ('training', 'quiz')),
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  score integer not null check (score between 0 and 100),
  completed_at timestamptz not null default now()
);

create index if not exists practice_attempts_team_completed_idx
  on public.practice_attempts (team_id, completed_at desc);

create index if not exists practice_attempts_user_completed_idx
  on public.practice_attempts (user_id, completed_at desc);

alter table public.practice_attempts enable row level security;

drop policy if exists "Players can record their own practice attempts" on public.practice_attempts;
create policy "Players can record their own practice attempts"
  on public.practice_attempts for insert to authenticated
  with check (
    auth.uid() = user_id
    and (
      team_id is null
      or exists (
        select 1 from public.team_members tm
        where tm.team_id = practice_attempts.team_id
          and tm.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Team members can read team practice attempts" on public.practice_attempts;
create policy "Team members can read team practice attempts"
  on public.practice_attempts for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = practice_attempts.team_id
        and tm.user_id = auth.uid()
    )
  );
