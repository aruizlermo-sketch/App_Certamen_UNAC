-- Ejecutar en Supabase SQL Editor si el presidente solo ve sus propias notas.
-- Idempotente: se puede correr varias veces.

-- Funciones RPC (evitan el filtro RLS para presidente)
create or replace function public.supervision_jurados(p_concurso_id uuid)
returns setof jurados
language sql
stable
security definer
set search_path = public
as $$
  select j.*
  from jurados j
  where j.concurso_id = p_concurso_id
    and (is_admin() or is_presidente_jurado());
$$;

create or replace function public.supervision_jurado_categorias(p_concurso_id uuid)
returns table(jurado_id uuid, categoria_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select jc.jurado_id, jc.categoria_id
  from jurado_categorias jc
  join categorias c on c.id = jc.categoria_id
  where c.concurso_id = p_concurso_id
    and (is_admin() or is_presidente_jurado());
$$;

grant execute on function public.supervision_jurados(uuid) to authenticated;
grant execute on function public.supervision_jurado_categorias(uuid) to authenticated;

-- Politicas RLS (refuerzo)
drop policy if exists "jurados_select" on jurados;
create policy "jurados_select" on jurados
  for select to authenticated
  using (user_id = auth.uid() or is_admin() or is_presidente_jurado());

drop policy if exists "jurado_categorias_select" on jurado_categorias;
create policy "jurado_categorias_select" on jurado_categorias
  for select to authenticated
  using (
    is_admin()
    or is_presidente_jurado()
    or jurado_id in (select my_jurado_ids())
  );
