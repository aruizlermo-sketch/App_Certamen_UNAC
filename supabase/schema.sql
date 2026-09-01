-- Certamen UNAC — Schema + seed UNAC 2026
-- Ejecutar en Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Perfiles de usuario (admin / jurado)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'jurado' check (rol in ('admin', 'jurado')),
  created_at timestamptz not null default now()
);

-- Concursos
create table if not exists concursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  escala_min numeric(4, 2) not null default 1 check (escala_min >= 0),
  escala_max numeric(4, 2) not null default 10 check (escala_max > escala_min),
  estado text not null default 'borrador' check (estado in ('borrador', 'activo', 'cerrado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger concursos_updated_at
  before update on concursos
  for each row execute function set_updated_at();

-- Categorías del concurso
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  concurso_id uuid not null references concursos (id) on delete cascade,
  nombre text not null,
  descripcion text,
  peso_total numeric(6, 3) not null default 1 check (peso_total >= 0),
  tiene_premio boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- Criterios por categoría
create table if not exists categoria_criterios (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias (id) on delete cascade,
  nombre text not null,
  descripcion text,
  peso numeric(5, 4) not null check (peso >= 0 and peso <= 1),
  orden int not null default 0
);

-- Participantes (tunas)
create table if not exists participantes (
  id uuid primary key default gen_random_uuid(),
  concurso_id uuid not null references concursos (id) on delete cascade,
  nombre text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- Jurados
create table if not exists jurados (
  id uuid primary key default gen_random_uuid(),
  concurso_id uuid not null references concursos (id) on delete cascade,
  nombre text not null,
  email text,
  user_id uuid references auth.users (id) on delete set null,
  es_presidente boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Asignación jurado ↔ categoría
create table if not exists jurado_categorias (
  jurado_id uuid not null references jurados (id) on delete cascade,
  categoria_id uuid not null references categorias (id) on delete cascade,
  primary key (jurado_id, categoria_id)
);

-- Calificaciones (celda del Excel)
create table if not exists calificaciones (
  id uuid primary key default gen_random_uuid(),
  jurado_id uuid not null references jurados (id) on delete cascade,
  participante_id uuid not null references participantes (id) on delete cascade,
  categoria_criterio_id uuid not null references categoria_criterios (id) on delete cascade,
  puntaje numeric(5, 2) not null check (puntaje >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (jurado_id, participante_id, categoria_criterio_id)
);

create trigger calificaciones_updated_at
  before update on calificaciones
  for each row execute function set_updated_at();

-- Índices
create index if not exists idx_categorias_concurso on categorias (concurso_id);
create index if not exists idx_participantes_concurso on participantes (concurso_id);
create index if not exists idx_jurados_concurso on jurados (concurso_id);
create index if not exists idx_calificaciones_lookup on calificaciones (participante_id, categoria_criterio_id);

-- RLS habilitado. Las politicas de produccion estan en policies.sql
alter table profiles enable row level security;
alter table concursos enable row level security;
alter table categorias enable row level security;
alter table categoria_criterios enable row level security;
alter table participantes enable row level security;
alter table jurados enable row level security;
alter table jurado_categorias enable row level security;
alter table calificaciones enable row level security;

-- Invitaciones admin (vinculacion por email)
create table if not exists admin_invites (
  email text primary key,
  nombre text not null default '',
  created_at timestamptz not null default now()
);

alter table admin_invites enable row level security;

create unique index if not exists idx_jurados_email_unique
  on jurados (lower(trim(email)))
  where email is not null and trim(email) <> '';

create unique index if not exists idx_jurados_un_presidente_por_concurso
  on jurados (concurso_id)
  where es_presidente = true;

-- ============================================================
-- SEED: Certamen UNAC 2026
-- ============================================================

insert into concursos (id, nombre, descripcion, escala_min, escala_max, estado)
values (
  'a0000000-0000-4000-8000-000000000001',
  'Certamen UNAC 2026',
  'Concurso de tunas universitarias — UNAC 2026',
  1, 10, 'activo'
) on conflict do nothing;

-- Participantes
insert into participantes (id, concurso_id, nombre, orden) values
  ('b0000001-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Tuna Universidad de Ciencias Aplicadas', 1),
  ('b0000001-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Tuna Universidad Inca Garcilazo de la Vega', 2),
  ('b0000001-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Tuna Universidad Nacional Federico Villarreal', 3),
  ('b0000001-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Tuna Universidad Cesar Vallejo', 4),
  ('b0000001-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Tuna Universidad Nacional Agraria de la Molina', 5),
  ('b0000001-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Tuna Universidad San Ignacio de Loyola', 6)
on conflict do nothing;

-- Jurados
insert into jurados (id, concurso_id, nombre) values
  ('c0000001-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Municipalidad Carmen de la Legua'),
  ('c0000001-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Ministerio de Cultura'),
  ('c0000001-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Tuna UNAC - Marco Perez'),
  ('c0000001-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Tuna UNAC - Henry Lopez')
on conflict do nothing;

-- Categorías
insert into categorias (id, concurso_id, nombre, descripcion, peso_total, orden) values
  ('d0000001-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Mejor Instrumental', 'Evalúa la ejecución musical centrada en calidad y coordinación de instrumentos.', 1, 1),
  ('d0000001-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Mejor Solista', 'Evalúa la actuación del solista vocal.', 1, 2),
  ('d0000001-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Mejor Pandereta', 'Evalúa el manejo de la pandereta.', 1, 3),
  ('d0000001-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Mejor Bandera', 'Evalúa el manejo de la bandera.', 1, 4),
  ('d0000001-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Mejor Capa', 'Evalúa la ejecución con capa.', 1, 5)
on conflict do nothing;

-- Criterios por categoría
insert into categoria_criterios (id, categoria_id, nombre, descripcion, peso, orden) values
  -- Mejor Instrumental
  ('e0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 'Calidad y precisión de los instrumentos', 'Afinación, calidad sonora y ejecución precisa.', 0.4, 1),
  ('e0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001', 'Coordinación y armonía entre los músicos', 'Sincronización y trabajo en equipo.', 0.3, 2),
  ('e0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000001', 'Dificultad de la composición', 'Complejidad de las piezas interpretadas.', 0.3, 3),
  -- Mejor Solista
  ('e0000001-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000002', 'Calidad de Técnica Vocal', 'Afinación, proyección, potencia y control.', 0.4, 1),
  ('e0000001-0000-4000-8000-000000000005', 'd0000001-0000-4000-8000-000000000002', 'Interpretación y Expresividad', 'Emoción, carisma y presencia escénica.', 0.3, 2),
  ('e0000001-0000-4000-8000-000000000006', 'd0000001-0000-4000-8000-000000000002', 'Dificultad de la pieza musical', 'Complejidad melódica y rango vocal.', 0.3, 3),
  -- Mejor Pandereta
  ('e0000001-0000-4000-8000-000000000007', 'd0000001-0000-4000-8000-000000000003', 'Manejo técnico y Habilidad', 'Dominio de movimientos, giros y lanzamientos.', 0.4, 1),
  ('e0000001-0000-4000-8000-000000000008', 'd0000001-0000-4000-8000-000000000003', 'Coreografía y Originalidad', 'Creatividad y sincronización con la música.', 0.3, 2),
  ('e0000001-0000-4000-8000-000000000009', 'd0000001-0000-4000-8000-000000000003', 'Vistosidad y Espectacularidad', 'Impacto visual, elegancia y fluidez.', 0.3, 3),
  -- Mejor Bandera
  ('e0000001-0000-4000-8000-000000000010', 'd0000001-0000-4000-8000-000000000004', 'Manejo técnico y Habilidad', 'Dominio de movimientos, giros y lanzamientos.', 0.4, 1),
  ('e0000001-0000-4000-8000-000000000011', 'd0000001-0000-4000-8000-000000000004', 'Coreografía y Originalidad', 'Creatividad y sincronización con la música.', 0.3, 2),
  ('e0000001-0000-4000-8000-000000000012', 'd0000001-0000-4000-8000-000000000004', 'Vistosidad y Espectacularidad', 'Impacto visual, elegancia y fluidez.', 0.3, 3),
  -- Mejor Capa
  ('e0000001-0000-4000-8000-000000000013', 'd0000001-0000-4000-8000-000000000005', 'Precisión y Sincronización', 'Precisión y sincronización en el manejo de la capa.', 0.4, 1),
  ('e0000001-0000-4000-8000-000000000014', 'd0000001-0000-4000-8000-000000000005', 'Calidad de Sonido', 'Calidad sonora de la ejecución.', 0.3, 2),
  ('e0000001-0000-4000-8000-000000000015', 'd0000001-0000-4000-8000-000000000005', 'Arreglo y Riqueza instrumental', 'Arreglo musical y riqueza instrumental.', 0.3, 3)
on conflict do nothing;

-- Asignación jurados por categoría (según Excel)
-- Mejor Instrumental: Municipalidad, Ministerio, Marco Perez
insert into jurado_categorias (jurado_id, categoria_id) values
  ('c0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001'),
  ('c0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000001'),
  ('c0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000001'),
  -- Mejor Solista: Ministerio, Henry Lopez, Marco Perez
  ('c0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000002'),
  ('c0000001-0000-4000-8000-000000000004', 'd0000001-0000-4000-8000-000000000002'),
  ('c0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000002'),
  -- Mejor Pandereta, Bandera, Capa: Municipalidad, Ministerio, Marco Perez
  ('c0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000003'),
  ('c0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000003'),
  ('c0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000003'),
  ('c0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000004'),
  ('c0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000004'),
  ('c0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000004'),
  ('c0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000005'),
  ('c0000001-0000-4000-8000-000000000002', 'd0000001-0000-4000-8000-000000000005'),
  ('c0000001-0000-4000-8000-000000000003', 'd0000001-0000-4000-8000-000000000005')
on conflict do nothing;
