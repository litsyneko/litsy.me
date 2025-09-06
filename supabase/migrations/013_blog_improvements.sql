-- Blog system improvements migration
-- This migration adds comprehensive improvements to the blog system

-- 1. Ensure posts table has user_id column
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Migrate existing author_id data to user_id if needed
UPDATE public.posts 
SET user_id = author_id 
WHERE author_id IS NOT NULL AND user_id IS NULL;

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at_desc ON public.posts(published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

-- 4. Add indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- 5. Create function to get posts with author information
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

-- 6. Create function to get single post with author information
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

-- 7. Create function to get comments with author information
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

-- 8. Create function to get posts by tag
CREATE OR REPLACE FUNCTION public.get_posts_by_tag(tag_name TEXT)
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
  WHERE p.published = true AND tag_name = ANY(p.tags)
  ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to get all unique tags
CREATE OR REPLACE FUNCTION public.get_all_tags()
RETURNS TABLE (tag TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT unnest(tags) as tag
  FROM public.posts
  WHERE published = true AND tags IS NOT NULL
  ORDER BY tag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update RLS policies for posts table
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

-- 11. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_posts_with_authors TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_post_with_author TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_comments_with_authors TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_posts_by_tag TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_tags TO anon, authenticated;

-- 12. Add constraint to ensure user_id is not null for new posts
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_user_id_not_null 
  CHECK (user_id IS NOT NULL OR author_id IS NOT NULL);

-- 13. Create function to sync user data when creating posts
CREATE OR REPLACE FUNCTION public.sync_user_on_post_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is provided, sync user data to profiles table
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    SELECT 
      NEW.user_id,
      COALESCE(au.raw_user_meta_data->>'username', au.raw_user_meta_data->>'user_name', split_part(au.email, '@', 1)),
      COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
      au.raw_user_meta_data->>'avatar_url'
    FROM auth.users au
    WHERE au.id = NEW.user_id
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, profiles.username),
      display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create trigger to sync user data on post creation
DROP TRIGGER IF EXISTS sync_user_on_post_creation_trigger ON public.posts;
CREATE TRIGGER sync_user_on_post_creation_trigger
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_on_post_creation();

-- 15. Create function to sync user data when creating comments
CREATE OR REPLACE FUNCTION public.sync_user_on_comment_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If author_id is provided, sync user data to profiles table
  IF NEW.author_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    SELECT 
      NEW.author_id,
      COALESCE(au.raw_user_meta_data->>'username', au.raw_user_meta_data->>'user_name', split_part(au.email, '@', 1)),
      COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
      au.raw_user_meta_data->>'avatar_url'
    FROM auth.users au
    WHERE au.id = NEW.author_id
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(EXCLUDED.username, profiles.username),
      display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create trigger to sync user data on comment creation
DROP TRIGGER IF EXISTS sync_user_on_comment_creation_trigger ON public.comments;
CREATE TRIGGER sync_user_on_comment_creation_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_on_comment_creation();