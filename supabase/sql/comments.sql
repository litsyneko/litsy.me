-- Create comments table
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table public.comments enable row level security;

-- Policies for comments table
create policy "Allow public read access to comments" on public.comments for select using (true);
create policy "Allow authenticated users to create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Allow owners to update their comments" on public.comments for update using (auth.uid() = author_id);
create policy "Allow owners to delete their comments" on public.comments for delete using (auth.uid() = author_id);
