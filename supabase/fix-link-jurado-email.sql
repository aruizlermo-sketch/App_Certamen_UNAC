-- Fix: el email manda al vincular jurado (corrige user_id de otra cuenta)
-- Ejecutar en Supabase SQL Editor si un jurado muestra "Cuenta vinculada"
-- pero el usuario correcto no puede entrar.

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

  -- El email configurado por admin es la fuente de verdad
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

-- Opcional: resetear vinculo incorrecto de Jose para forzar re-login
-- update jurados set user_id = null where lower(trim(email)) = 'jose1907040220@gmail.com';
