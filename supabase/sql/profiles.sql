-- Profiles table keyed by Clerk user id (text)
create table if not exists public.profiles (
  id text primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Only the owner can select/update/insert self
create policy if not exists "profiles read own" on public.profiles
for select using (id = request.jwt.claims.sub);

create policy if not exists "profiles update own" on public.profiles
for update using (id = request.jwt.claims.sub);

create policy if not exists "profiles insert self" on public.profiles
for insert with check (id = request.jwt.claims.sub);

