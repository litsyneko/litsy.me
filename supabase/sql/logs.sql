-- Create logs table
create table public.logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null, -- e.g., 'POST_CREATED', 'POST_UPDATED', 'COMMENT_DELETED'
  entity_id text, -- ID of the post or comment
  details jsonb, -- Additional details like old_title, new_title, etc.
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS) for logs
-- Allow authenticated users to insert logs
create policy "Allow authenticated users to insert logs" on public.logs for insert with check (auth.uid() = user_id);
-- Allow owners to view their own logs (optional, or admin only)
create policy "Allow owners to view their own logs" on public.logs for select using (auth.uid() = user_id);
-- No update or delete policies for logs (logs should be immutable)
