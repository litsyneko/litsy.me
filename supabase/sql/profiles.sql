-- Profiles table keyed by Supabase auth.users id (uuid)
create table if not exists public.profiles (
  id uuid primary key references auth.users not null,
  display_name text,
  avatar_url text,
  role text default 'user',
  updated_at timestamptz default now()
);

-- enable Row Level Security
alter table public.profiles enable row level security;

-- Public read for profiles (adjust as needed)
create policy "public profiles read" on public.profiles
  for select using (true);

-- Only the authenticated user can insert/update their own profile
create policy "profiles insert self" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles update self" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Trigger: automatically create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- create a profile row if it doesn't already exist
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', new.raw_app_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
