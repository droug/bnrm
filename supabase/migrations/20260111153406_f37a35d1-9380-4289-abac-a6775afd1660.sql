-- Create / ensure the Storage bucket used by the Digital Library bulk import exists
insert into storage.buckets (id, name, public)
values ('digital-library', 'digital-library', true)
on conflict (id)
do update set name = excluded.name, public = excluded.public;

-- Policies on storage.objects for the digital-library bucket
-- We align with existing patterns in the project (admin/librarian via is_admin_or_librarian(auth.uid()))

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='Public can view digital library files'
  ) then
    drop policy "Public can view digital library files" on storage.objects;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='Admins and librarians can upload digital library files'
  ) then
    drop policy "Admins and librarians can upload digital library files" on storage.objects;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='Admins and librarians can update digital library files'
  ) then
    drop policy "Admins and librarians can update digital library files" on storage.objects;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='Admins and librarians can delete digital library files'
  ) then
    drop policy "Admins and librarians can delete digital library files" on storage.objects;
  end if;
end $$;

create policy "Public can view digital library files"
on storage.objects
for select
to public
using (bucket_id = 'digital-library');

create policy "Admins and librarians can upload digital library files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'digital-library'
  and is_admin_or_librarian(auth.uid())
);

create policy "Admins and librarians can update digital library files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'digital-library'
  and is_admin_or_librarian(auth.uid())
)
with check (
  bucket_id = 'digital-library'
  and is_admin_or_librarian(auth.uid())
);

create policy "Admins and librarians can delete digital library files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'digital-library'
  and is_admin_or_librarian(auth.uid())
);
