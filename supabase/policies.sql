-- Certamen UNAC — Politicas RLS, auth por email y presidente del jurado
-- Ejecutar DESPUES de schema.sql (instalacion nueva o migracion)

-- ============================================================
-- Funciones auxiliares RLS
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

create or replace function public.my_jurado_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from jurados where user_id = auth.uid() and activo = true;
$$;

create or replace function public.my_assigned_criterio_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select cc.id
  from categoria_criterios cc
  join jurado_categorias jc on jc.categoria_id = cc.categoria_id
  join jurados j on j.id = jc.jurado_id
  where j.user_id = auth.uid() and j.activo = true;
$$;

create or replace function public.is_presidente_jurado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from jurados
    where user_id = auth.uid()
      and activo = true
      and es_presidente = true
  );
$$;

-- ============================================================
-- Vinculacion de cuentas por email
-- ============================================================

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
    and activo = true;

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

-- ============================================================
-- Limpiar politicas permisivas (instalaciones antiguas)
-- ============================================================

drop policy if exists "authenticated_all_profiles" on profiles;
drop policy if exists "authenticated_all_concursos" on concursos;
drop policy if exists "authenticated_all_categorias" on categorias;
drop policy if exists "authenticated_all_criterios" on categoria_criterios;
drop policy if exists "authenticated_all_participantes" on participantes;
drop policy if exists "authenticated_all_jurados" on jurados;
drop policy if exists "authenticated_all_jurado_categorias" on jurado_categorias;
drop policy if exists "authenticated_all_calificaciones" on calificaciones;

-- ============================================================
-- Politicas de produccion
-- ============================================================

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select to authenticated
  using (id = auth.uid() or is_admin());

drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all" on profiles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "concursos_select" on concursos;
create policy "concursos_select" on concursos
  for select to authenticated using (true);

drop policy if exists "concursos_admin_write" on concursos;
create policy "concursos_admin_write" on concursos
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "categorias_select" on categorias;
create policy "categorias_select" on categorias
  for select to authenticated using (true);

drop policy if exists "categorias_admin_write" on categorias;
create policy "categorias_admin_write" on categorias
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "criterios_select" on categoria_criterios;
create policy "criterios_select" on categoria_criterios
  for select to authenticated using (true);

drop policy if exists "criterios_admin_write" on categoria_criterios;
create policy "criterios_admin_write" on categoria_criterios
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "participantes_select" on participantes;
create policy "participantes_select" on participantes
  for select to authenticated using (true);

drop policy if exists "participantes_admin_write" on participantes;
create policy "participantes_admin_write" on participantes
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "jurados_select" on jurados;
create policy "jurados_select" on jurados
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "jurados_admin_write" on jurados;
create policy "jurados_admin_write" on jurados
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "jurado_categorias_select" on jurado_categorias;
create policy "jurado_categorias_select" on jurado_categorias
  for select to authenticated
  using (
    is_admin()
    or jurado_id in (select my_jurado_ids())
  );

drop policy if exists "jurado_categorias_admin_write" on jurado_categorias;
create policy "jurado_categorias_admin_write" on jurado_categorias
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "calificaciones_jurado_select_own" on calificaciones;
create policy "calificaciones_jurado_select_own" on calificaciones
  for select to authenticated
  using (
    is_admin()
    or is_presidente_jurado()
    or jurado_id in (select my_jurado_ids())
  );

drop policy if exists "calificaciones_jurado_insert_own" on calificaciones;
create policy "calificaciones_jurado_insert_own" on calificaciones
  for insert to authenticated
  with check (
    is_admin()
    or (
      jurado_id in (select my_jurado_ids())
      and categoria_criterio_id in (select my_assigned_criterio_ids())
    )
  );

drop policy if exists "calificaciones_jurado_update_own" on calificaciones;
create policy "calificaciones_jurado_update_own" on calificaciones
  for update to authenticated
  using (
    is_admin()
    or jurado_id in (select my_jurado_ids())
  )
  with check (
    is_admin()
    or (
      jurado_id in (select my_jurado_ids())
      and categoria_criterio_id in (select my_assigned_criterio_ids())
    )
  );

drop policy if exists "calificaciones_admin_delete" on calificaciones;
create policy "calificaciones_admin_delete" on calificaciones
  for delete to authenticated
  using (is_admin());

drop policy if exists "admin_invites_admin_all" on admin_invites;
create policy "admin_invites_admin_all" on admin_invites
  for all to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "admin_invites_select_own" on admin_invites;
create policy "admin_invites_select_own" on admin_invites
  for select to authenticated
  using (lower(trim(email)) = lower(trim(auth.jwt() ->> 'email')));

-- ============================================================
-- Trigger: perfil al registrar (rol fijo jurado; admin via invite)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    'jurado'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
