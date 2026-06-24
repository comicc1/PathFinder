create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  content text not null,
  skills text,
  template_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_id uuid references public.resume_drafts(id) on delete set null,
  resume_title text not null,
  resume_text text not null,
  feedback text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resume_drafts enable row level security;
alter table public.resume_analyses enable row level security;
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

drop policy if exists "Users can read their drafts" on public.resume_drafts;
create policy "Users can read their drafts"
on public.resume_drafts
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their drafts" on public.resume_drafts;
create policy "Users can insert their drafts"
on public.resume_drafts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their drafts" on public.resume_drafts;
create policy "Users can update their drafts"
on public.resume_drafts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their drafts" on public.resume_drafts;
create policy "Users can delete their drafts"
on public.resume_drafts
for delete
using (auth.uid() = user_id);

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
