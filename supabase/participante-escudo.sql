-- Escudo universitario por participante (ruta en public/, ej. /escudos/uca.png)
alter table participantes
  add column if not exists escudo_url text;
