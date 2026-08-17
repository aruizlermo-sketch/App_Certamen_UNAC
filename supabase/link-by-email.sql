-- Vinculacion de cuentas por email (ejecutar en Supabase SQL Editor)

alter table jurados
  add column if not exists email text;

create unique index if not exists idx_jurados_email_unique
  on jurados (lower(trim(email)))
  where email is not null and trim(email) <> '';

create table if not exists admin_invites (
  email text primary key,
  nombre text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.link_user_by_email(p_user_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_admin_nombre text;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'No autorizado';
  end if;

  if v_email is null or v_email = '' then
    return;
  end if;

  update jurados
  set user_id = p_user_id
  where lower(trim(email)) = v_email
    and (user_id is null or user_id = p_user_id);

  select nombre into v_admin_nombre
  from admin_invites
  where lower(trim(email)) = v_email
  limit 1;

  if v_admin_nombre is not null then
    insert into profiles (id, nombre, rol)
    values (
      p_user_id,
      coalesce(nullif(v_admin_nombre, ''), split_part(p_email, '@', 1)),
      'admin'
    )
    on conflict (id) do update
      set rol = 'admin',
          nombre = excluded.nombre;

    delete from admin_invites where lower(trim(email)) = v_email;
  elsif exists (select 1 from jurados where user_id = p_user_id and activo = true) then
    insert into profiles (id, nombre, rol)
    values (p_user_id, split_part(p_email, '@', 1), 'jurado')
    on conflict (id) do update set rol = 'jurado';
  end if;
end;
$$;

grant execute on function public.link_user_by_email(uuid, text) to authenticated;

-- RLS admin_invites
alter table admin_invites enable row level security;

drop policy if exists "admin_invites_admin_all" on admin_invites;
create policy "admin_invites_admin_all" on admin_invites
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "admin_invites_select_own" on admin_invites;
create policy "admin_invites_select_own" on admin_invites
  for select to authenticated
  using (lower(trim(email)) = lower(trim(auth.jwt() ->> 'email')));
