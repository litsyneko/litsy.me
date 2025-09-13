-- Create a public bucket for avatars (idempotent)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public read from avatars bucket
create policy if not exists "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload/update their files under public/ or user-id prefixes
create policy if not exists "Authenticated upload avatars"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars');

create policy if not exists "Authenticated update avatars"
on storage.objects for update to authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

