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
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload/update their files under public/{userId}/ or temp/{userId}/
-- NOTE: cast auth.uid() to text to avoid text = uuid operator error
create policy "Authenticated upload avatars"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    AND (
      (
        (storage.foldername(name))[1] = 'public'
        AND (storage.foldername(name))[2] = (select auth.uid())::text
      )
      OR
      (
        (storage.foldername(name))[1] = 'temp'
        AND (storage.foldername(name))[2] = (select auth.uid())::text
      )
    )
  );

create policy "Authenticated update avatars"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] in ('public','temp')
      AND (storage.foldername(name))[2] = (select auth.uid())::text
    )
  )
  with check (
    bucket_id = 'avatars'
    AND (
      (storage.foldername(name))[1] in ('public','temp')
      AND (storage.foldername(name))[2] = (select auth.uid())::text
    )
  );

-- Allow authenticated users to delete their temp files (only their own temp/{userId}/)
create policy "Authenticated delete temp avatars"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'temp'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );
