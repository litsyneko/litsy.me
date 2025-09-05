-- Supabase migration: initial tables for projects and posts

-- projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  body text,
  cover_url text,
  tech text[],
  repo_url text,
  live_url text,
  published boolean DEFAULT false,
  author_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  content text,
  tags text[],
  cover_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  author_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- sample data (optional)
INSERT INTO public.projects (title, slug, summary, body, tech, repo_url, live_url, published)
VALUES
('프로젝트 예시', 'example-project', '간단한 예시 프로젝트', '# 예시\n내용', ARRAY['Next.js','TypeScript'], 'https://github.com/litsyme/example', 'https://example.com', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.posts (title, slug, summary, content, tags, published, published_at)
VALUES
('첫 블로그 글', 'hello-world', '첫 블로그 포스트 예시', '# 안녕하세요\n이것은 예시입니다.', ARRAY['intro','example'], true, now())
ON CONFLICT (slug) DO NOTHING;
