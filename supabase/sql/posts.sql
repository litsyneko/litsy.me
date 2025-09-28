-- Create posts table
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  main_image_url text,
  media_urls jsonb default '[]'::jsonb, -- Array of media URLs
  media_types jsonb default '[]'::jsonb, -- Array of media types (image, video, etc.)
  featured_media_url text, -- Featured media for social sharing
  featured_media_type text, -- Type of featured media
  tags text[] default '{}', -- Array of tags
  category text,
  reading_time integer, -- Estimated reading time in minutes
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  published boolean default false not null,
  published_at timestamp with time zone,
  views integer default 0,
  likes integer default 0
);

-- Set up Row Level Security (RLS)
alter table public.posts enable row level security;

-- Policies for posts table
create policy "Allow public read access" on public.posts for select using (true);
create policy "Allow authenticated users to create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Allow owners to update their posts" on public.posts for update using (auth.uid() = author_id);
create policy "Allow owners to delete their posts" on public.posts for delete using (auth.uid() = author_id);

-- Create a function to update the updated_at column and set published_at
create function public.update_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  -- Set published_at when post is first published
  if old.published = false and new.published = true and old.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

-- Create a trigger to call the function before update
create trigger update_posts_updated_at_trigger
before update on public.posts
for each row execute function public.update_posts_updated_at();
