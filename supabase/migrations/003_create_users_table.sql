-- Create a users table to cache auth user metadata for faster lookups and syncing
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  provider text,
  username text,
  display_name text,
  avatar text,
  metadata jsonb,
  last_synced timestamptz DEFAULT now()
);

-- index on username for lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
