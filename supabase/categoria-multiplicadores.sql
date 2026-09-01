-- Migracion: pesos de categoria (0-1) -> multiplicadores (>= 0)
-- Ejecutar en Supabase SQL Editor en produccion.

alter table categorias drop constraint if exists categorias_peso_total_check;

alter table categorias
  alter column peso_total type numeric(6, 3),
  alter column peso_total set default 1;

alter table categorias
  add constraint categorias_peso_total_check check (peso_total >= 0);

-- Opcional: convertir pesos antiguos (0.2) a multiplicador 1
-- update categorias set peso_total = 1 where peso_total <= 0.2;
