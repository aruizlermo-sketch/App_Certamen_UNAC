-- Migracion: roles hermeticos — jurado solo ve/edita sus calificaciones
-- Ejecutar en Supabase SQL Editor despues de schema.sql

-- Funciones auxiliares RLS
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

-- Eliminar politicas permisivas
drop policy if exists "authenticated_all_profiles" on profiles;
drop policy if exists "authenticated_all_concursos" on concursos;
drop policy if exists "authenticated_all_categorias" on categorias;
drop policy if exists "authenticated_all_criterios" on categoria_criterios;
drop policy if exists "authenticated_all_participantes" on participantes;
drop policy if exists "authenticated_all_jurados" on jurados;
drop policy if exists "authenticated_all_jurado_categorias" on jurado_categorias;
drop policy if exists "authenticated_all_calificaciones" on calificaciones;

-- Perfiles: leer propio; admin lee todos
create policy "profiles_select_own" on profiles
  for select to authenticated
  using (id = auth.uid() or is_admin());

create policy "profiles_admin_all" on profiles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- Concursos, categorias, criterios, participantes: lectura autenticados; escritura solo admin
create policy "concursos_select" on concursos
  for select to authenticated using (true);

create policy "concursos_admin_write" on concursos
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "categorias_select" on categorias
  for select to authenticated using (true);

create policy "categorias_admin_write" on categorias
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "criterios_select" on categoria_criterios
  for select to authenticated using (true);

create policy "criterios_admin_write" on categoria_criterios
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "participantes_select" on participantes
  for select to authenticated using (true);

create policy "participantes_admin_write" on participantes
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- Jurados: ver propio registro o admin ve todos
create policy "jurados_select" on jurados
  for select to authenticated
  using (user_id = auth.uid() or is_admin());

create policy "jurados_admin_write" on jurados
  for all to authenticated
  using (is_admin())
  with check (is_admin());

create policy "jurado_categorias_select" on jurado_categorias
  for select to authenticated
  using (
    is_admin()
    or jurado_id in (select my_jurado_ids())
  );

create policy "jurado_categorias_admin_write" on jurado_categorias
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- Calificaciones: hermetico por jurado
create policy "calificaciones_jurado_select_own" on calificaciones
  for select to authenticated
  using (
    is_admin()
    or jurado_id in (select my_jurado_ids())
  );

create policy "calificaciones_jurado_insert_own" on calificaciones
  for insert to authenticated
  with check (
    is_admin()
    or (
      jurado_id in (select my_jurado_ids())
      and categoria_criterio_id in (select my_assigned_criterio_ids())
    )
  );

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

create policy "calificaciones_admin_delete" on calificaciones
  for delete to authenticated
  using (is_admin());

-- Trigger: crear perfil al registrar usuario (default jurado)
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
    coalesce(new.raw_user_meta_data->>'rol', 'jurado')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
