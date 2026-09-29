create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins can verify their own access" on public.admin_users;
create policy "Admins can verify their own access"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_cuber_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_cuber_admin() from public;
grant execute on function public.is_cuber_admin() to authenticated;

create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  name_en text not null,
  description_tr text not null,
  description_en text not null,
  category_tr text not null,
  category_en text not null,
  cpu text not null default '',
  gpu text not null default '',
  motherboard text not null default '',
  ram text not null default '',
  storage text not null default '',
  cpu_cooler text not null default '',
  pc_case text not null default '',
  case_fans text not null default '',
  psu text not null default '',
  additional_specs_tr text[] not null default '{}',
  additional_specs_en text[] not null default '{}',
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'builds'
  ) then
    execute 'alter publication supabase_realtime add table public.builds';
  end if;
end
$$;

alter table public.builds enable row level security;
grant select on public.builds to anon, authenticated;
grant insert, update, delete on public.builds to authenticated;

drop policy if exists "Anyone can view CUBER builds" on public.builds;
create policy "Anyone can view CUBER builds"
  on public.builds for select
  using (true);

drop policy if exists "CUBER admins can insert builds" on public.builds;
create policy "CUBER admins can insert builds"
  on public.builds for insert to authenticated
  with check ((select public.is_cuber_admin()));

drop policy if exists "CUBER admins can update builds" on public.builds;
create policy "CUBER admins can update builds"
  on public.builds for update to authenticated
  using ((select public.is_cuber_admin()))
  with check ((select public.is_cuber_admin()));

drop policy if exists "CUBER admins can delete builds" on public.builds;
create policy "CUBER admins can delete builds"
  on public.builds for delete to authenticated
  using ((select public.is_cuber_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'build-images',
  'build-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view CUBER build images" on storage.objects;
create policy "Anyone can view CUBER build images"
  on storage.objects for select
  using (bucket_id = 'build-images');

drop policy if exists "CUBER admins can upload build images" on storage.objects;
create policy "CUBER admins can upload build images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'build-images'
    and (select public.is_cuber_admin())
  );

drop policy if exists "CUBER admins can update build images" on storage.objects;
create policy "CUBER admins can update build images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'build-images'
    and (select public.is_cuber_admin())
  )
  with check (
    bucket_id = 'build-images'
    and (select public.is_cuber_admin())
  );

drop policy if exists "CUBER admins can delete build images" on storage.objects;
create policy "CUBER admins can delete build images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'build-images'
    and (select public.is_cuber_admin())
  );
