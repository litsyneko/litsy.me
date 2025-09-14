-- Create a public bucket for avatars (idempotent)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Authenticated upload avatars" on storage.objects;
drop policy if exists "Authenticated update avatars" on storage.objects;
drop policy if exists "Authenticated delete temp avatars" on storage.objects;

-- Allow public read from avatars bucket
create policy "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload/update their files under public/, temp/, or user-id prefixes
create policy "Authenticated upload avatars"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (name ~ '^public/' or name ~ '^temp/' or name ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/')
);

create policy "Authenticated update avatars"
on storage.objects for update to authenticated
using (bucket_id = 'avatars')
with check (
  bucket_id = 'avatars'
  and (name ~ '^public/' or name ~ '^temp/' or name ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/')
);

-- Allow authenticated users to delete their temp files
create policy "Authenticated delete temp avatars"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and name ~ '^temp/'
);
