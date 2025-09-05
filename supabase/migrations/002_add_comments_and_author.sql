-- Add author fields to posts and comments table
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS author_avatar text;

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text,
  author_avatar text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- sample comment
INSERT INTO public.comments (post_id, author_name, content)
SELECT id, 'Visitor', '좋은 글 감사합니다!' FROM public.posts WHERE slug = 'hello-world' LIMIT 1
ON CONFLICT DO NOTHING;
