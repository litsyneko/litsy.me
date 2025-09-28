-- Create blog-images storage bucket
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Set up RLS for blog-images bucket
-- Allow authenticated users to upload images
create policy "Allow authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id = 'blog-images');

-- Allow authenticated users to update their own images
create policy "Allow authenticated updates" on storage.objects for update to authenticated using (bucket_id = 'blog-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
create policy "Allow authenticated deletes" on storage.objects for delete to authenticated using (bucket_id = 'blog-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow all users to read images
create policy "Allow public read access" on storage.objects for select using (bucket_id = 'blog-images');
