-- Enhanced authentication system migration
-- This migration adds necessary columns and constraints for the authentication system

-- 1. Enhance users table for authentication
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add unique constraint on email
ALTER TABLE public.users 
  ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Add unique constraint on username
ALTER TABLE public.users 
  ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Update existing index and add new ones
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(provider);

-- 2. Enhance comments table
ALTER TABLE public.comments 
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add foreign key constraint to comments table
ALTER TABLE public.comments 
  ADD CONSTRAINT comments_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 3. Add foreign key constraints to posts and projects tables
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.projects 
  ADD CONSTRAINT projects_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for users table
-- Users can view all profiles
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- 6. Create RLS policies for comments table
-- Anyone can view comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- 7. Create RLS policies for posts table
-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true OR auth.uid() = author_id);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 8. Create RLS policies for projects table
-- Anyone can view published projects
CREATE POLICY "Anyone can view published projects" ON public.projects
  FOR SELECT USING (published = true OR auth.uid() = author_id);

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = author_id);

-- 9. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, email_verified, provider, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.email_confirmed_at IS NOT NULL,
    COALESCE(new.app_metadata->>'provider', 'email'),
    new.created_at,
    new.updated_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Create function to sync user data
CREATE OR REPLACE FUNCTION public.sync_user_data()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    email = new.email,
    email_verified = new.email_confirmed_at IS NOT NULL,
    updated_at = new.updated_at,
    last_synced = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync user data on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_data();

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_author_id ON public.projects(author_id);

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT ALL ON public.projects TO authenticated;