-- Fix posts table to use user_id instead of author_id for consistency
-- This migration ensures proper foreign key relationships and data integrity

-- 1. Add user_id column to posts table if it doesn't exist
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Migrate existing author_id data to user_id
UPDATE public.posts 
SET user_id = author_id 
WHERE author_id IS NOT NULL AND user_id IS NULL;

-- 3. Add index for user_id
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- 4. Update RLS policies to use user_id instead of author_id
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- Create new RLS policies using user_id
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Add constraint to ensure user_id is not null for new posts
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_user_id_not_null 
  CHECK (user_id IS NOT NULL OR author_id IS NOT NULL);

-- 6. Create function to get posts with author information
CREATE OR REPLACE FUNCTION public.get_posts_with_authors(
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0,
  published_only BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  summary TEXT,
  content TEXT,
  tags TEXT[],
  cover_url TEXT,
  published BOOLEAN,
  published_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.summary,
    p.content,
    p.tags,
    p.cover_url,
    p.published,
    p.published_at,
    p.user_id,
    p.author_id,
    p.created_at,
    p.updated_at,
    COALESCE(p.author_name, pr.display_name, au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', 'Anonymous') as author_name,
    COALESCE(pr.username, au.raw_user_meta_data->>'username', au.raw_user_meta_data->>'user_name') as author_username,
    COALESCE(p.author_avatar, pr.avatar_url, au.raw_user_meta_data->>'avatar_url') as author_avatar
  FROM public.posts p
  LEFT JOIN public.profiles pr ON p.user_id = pr.id
  LEFT JOIN auth.users au ON p.user_id = au.id
  WHERE (NOT published_only OR p.published = true)
  ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get single post with author information
CREATE OR REPLACE FUNCTION public.get_post_with_author(post_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  summary TEXT,
  content TEXT,
  tags TEXT[],
  cover_url TEXT,
  published BOOLEAN,
  published_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT,
  author_username TEXT,
  author_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.summary,
    p.content,
    p.tags,
    p.cover_url,
    p.published,
    p.published_at,
    p.user_id,
    p.author_id,
    p.created_at,
    p.updated_at,
    COALESCE(p.author_name, pr.display_name, au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', 'Anonymous') as author_name,
    COALESCE(pr.username, au.raw_user_meta_data->>'username', au.raw_user_meta_data->>'user_name') as author_username,
    COALESCE(p.author_avatar, pr.avatar_url, au.raw_user_meta_data->>'avatar_url') as author_avatar
  FROM public.posts p
  LEFT JOIN public.profiles pr ON p.user_id = pr.id
  LEFT JOIN auth.users au ON p.user_id = au.id
  WHERE p.slug = post_slug AND p.published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get comments with author information
CREATE OR REPLACE FUNCTION public.get_comments_with_authors(post_id_param UUID)
RETURNS TABLE (
  id UUID,
  post_id UUID,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  author_username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.post_id,
    c.author_id,
    COALESCE(c.author_name, pr.display_name, au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', 'Anonymous') as author_name,
    COALESCE(c.author_avatar, pr.avatar_url, au.raw_user_meta_data->>'avatar_url') as author_avatar,
    c.content,
    c.created_at,
    c.updated_at,
    COALESCE(pr.username, au.raw_user_meta_data->>'username', au.raw_user_meta_data->>'user_name') as author_username
  FROM public.comments c
  LEFT JOIN public.profiles pr ON c.author_id = pr.id
  LEFT JOIN auth.users au ON c.author_id = au.id
  WHERE c.post_id = post_id_param
  ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_posts_with_authors TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_post_with_author TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_comments_with_authors TO anon, authenticated;