-- Reset de calificaciones — Certamen UNAC
-- Ejecutar en Supabase → SQL Editor (rol postgres; ignora RLS)
--
-- Uso:
--   1. Revisa el conteo con la consulta de verificacion (abajo).
--   2. Descomenta UNA de las opciones DELETE.
--   3. Vuelve a ejecutar la verificacion (debe dar 0).

-- ============================================================
-- Verificacion (ejecutar antes y despues)
-- ============================================================

-- Total global
-- SELECT count(*) AS calificaciones_totales FROM calificaciones;

-- Por concurso
-- SELECT c.nombre, count(cal.id) AS calificaciones
-- FROM concursos c
-- LEFT JOIN categorias cat ON cat.concurso_id = c.id
-- LEFT JOIN categoria_criterios cc ON cc.categoria_id = cat.id
-- LEFT JOIN calificaciones cal ON cal.categoria_criterio_id = cc.id
-- GROUP BY c.id, c.nombre
-- ORDER BY c.nombre;

-- ============================================================
-- OPCION A (recomendada): solo Certamen UNAC 2026 (seed)
-- ============================================================

/*
DELETE FROM calificaciones
WHERE categoria_criterio_id IN (
  SELECT cc.id
  FROM categoria_criterios cc
  JOIN categorias cat ON cat.id = cc.categoria_id
  WHERE cat.concurso_id = 'a0000000-0000-4000-8000-000000000001'
);
*/

-- ============================================================
-- OPCION B: concurso activo (el que tenga estado = 'activo')
-- ============================================================

/*
DELETE FROM calificaciones
WHERE categoria_criterio_id IN (
  SELECT cc.id
  FROM categoria_criterios cc
  JOIN categorias cat ON cat.id = cc.categoria_id
  JOIN concursos c ON c.id = cat.concurso_id
  WHERE c.estado = 'activo'
);
*/

-- ============================================================
-- OPCION C: por UUID de concurso (cambia el valor)
-- ============================================================

/*
DELETE FROM calificaciones
WHERE categoria_criterio_id IN (
  SELECT cc.id
  FROM categoria_criterios cc
  JOIN categorias cat ON cat.id = cc.categoria_id
  WHERE cat.concurso_id = 'REEMPLAZA-CON-UUID-DEL-CONCURSO'
);
*/

-- ============================================================
-- OPCION D: borrar TODAS las calificaciones (todos los concursos)
-- ============================================================

/*
DELETE FROM calificaciones;
*/

-- ============================================================
-- Notas
-- ============================================================
-- - No borra participantes, jurados, categorias ni criterios.
-- - Los jurados pueden volver a calificar desde la app.
-- - Si ejecutas como usuario autenticado (no SQL Editor), RLS
--   solo permitira DELETE si eres admin.
