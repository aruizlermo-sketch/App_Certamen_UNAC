-- Cerrar evaluacion por tuna. Ejecutar en Supabase SQL Editor.
-- El jurado (incluido presidente) no puede crear ni modificar notas
-- de una tuna con evaluacion_cerrada = true. El admin si puede.

alter table participantes
  add column if not exists evaluacion_cerrada boolean not null default false;

create or replace function public.participante_evaluacion_abierta(p_participante_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from participantes
    where id = p_participante_id
      and evaluacion_cerrada = false
  );
$$;

drop policy if exists "calificaciones_jurado_insert_own" on calificaciones;
create policy "calificaciones_jurado_insert_own" on calificaciones
  for insert to authenticated
  with check (
    is_admin()
    or (
      jurado_id in (select my_jurado_ids())
      and categoria_criterio_id in (select my_assigned_criterio_ids())
      and participante_evaluacion_abierta(participante_id)
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
      and participante_evaluacion_abierta(participante_id)
    )
  );
