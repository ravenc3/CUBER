create or replace function public.is_cuber_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where id = (select auth.uid())
      and lower(email) = 'mr.medel.2002@gmail.com'
  );
$$;

revoke all on function public.is_cuber_admin() from public, anon;
grant execute on function public.is_cuber_admin() to authenticated;

drop table if exists public.admin_users;
