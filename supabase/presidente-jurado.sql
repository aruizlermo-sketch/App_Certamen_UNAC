-- Presidente del jurado: un solo jurado por concurso con vision de resultados (solo lectura)

alter table jurados
  add column if not exists es_presidente boolean not null default false;

create unique index if not exists idx_jurados_un_presidente_por_concurso
  on jurados (concurso_id)
  where es_presidente = true;

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

-- Presidente puede leer todas las calificaciones (solo lectura)
drop policy if exists "calificaciones_jurado_select_own" on calificaciones;
create policy "calificaciones_jurado_select_own" on calificaciones
  for select to authenticated
  using (
    is_admin()
    or is_presidente_jurado()
    or jurado_id in (select my_jurado_ids())
  );
