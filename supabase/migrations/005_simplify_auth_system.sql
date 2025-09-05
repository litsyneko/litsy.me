-- Simplify authentication system by using Supabase Auth directly
-- Remove custom users table and use auth.users instead

-- 1. Update comments table to reference auth.users directly
ALTER TABLE public.comments 
  DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

-- Rename author_id to user_id for clarity
ALTER TABLE public.comments 
  RENAME COLUMN author_id TO user_id;

-- Add foreign key constraint to auth.users
ALTER TABLE public.comments 
  ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update posts table to reference auth.users directly
ALTER TABLE public.posts 
  DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Rename author_id to user_id for clarity
ALTER TABLE public.posts 
  RENAME COLUMN author_id TO user_id;

-- Add foreign key constraint to auth.users
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Update projects table to reference auth.users directly
ALTER TABLE public.projects 
  DROP CONSTRAINT IF EXISTS projects_author_id_fkey;

-- Rename author_id to user_id for clarity
ALTER TABLE public.projects 
  RENAME COLUMN author_id TO user_id;

-- Add foreign key constraint to auth.users
ALTER TABLE public.projects 
  ADD CONSTRAINT projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 5. Update RLS policies to use auth.users
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

DROP POLICY IF EXISTS "Anyone can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Create new RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create new RLS policies for posts
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create new RLS policies for projects
CREATE POLICY "Anyone can view published projects" ON public.projects
  FOR SELECT USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Drop the custom users table and related functions/triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_user_data();

-- Drop all users table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;

-- Finally drop the users table
DROP TABLE IF EXISTS public.users CASCADE;

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT ALL ON public.projects TO authenticated;