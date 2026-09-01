-- Agregar flag de premio por categoria. Ejecutar en Supabase SQL Editor.

alter table categorias
  add column if not exists tiene_premio boolean not null default true;
