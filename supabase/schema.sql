create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_title text not null,
  resume_text text not null,
  feedback text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid not null references public.resume_analyses(id) on delete cascade,
  questions jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.interview_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_id text not null,
  question_text text not null,
  user_answer text not null,
  evaluation jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.resume_analyses enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_responses enable row level security;
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, created_at, updated_at)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'PathFinder user'
    ),
    now(),
    now()
  )
  on conflict (id) do update
    set username = excluded.username,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete their profile" on public.profiles;
create policy "Users can delete their profile"
on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists "Users can read their analyses" on public.resume_analyses;
create policy "Users can read their analyses"
on public.resume_analyses
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their analyses" on public.resume_analyses;
create policy "Users can insert their analyses"
on public.resume_analyses
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their analyses" on public.resume_analyses;
create policy "Users can update their analyses"
on public.resume_analyses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their analyses" on public.resume_analyses;
create policy "Users can delete their analyses"
on public.resume_analyses
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their own interview sessions" on public.interview_sessions;
create policy "Users can read their own interview sessions"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own interview sessions" on public.interview_sessions;
create policy "Users can insert their own interview sessions"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own interview responses" on public.interview_responses;
create policy "Users can read their own interview responses"
  on public.interview_responses for select
  using (
    exists (
      select 1 from public.interview_sessions
      where public.interview_sessions.id = public.interview_responses.session_id
      and public.interview_sessions.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert their own interview responses" on public.interview_responses;
create policy "Users can insert their own interview responses"
  on public.interview_responses for insert
  with check (
    exists (
      select 1 from public.interview_sessions
      where public.interview_sessions.id = public.interview_responses.session_id
      and public.interview_sessions.user_id = auth.uid()
    )
  );
