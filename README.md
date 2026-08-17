# Certamen UNAC — Sistema de Calificacion

App para concurso de tunas universitarias con jurados, categorias configurables y resultados en vivo.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Auth + Postgres)

## Inicio rapido (modo demo)

```bash
npm install
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001). Sin Supabase configurado, la app funciona en modo demo con datos del Certamen UNAC 2026.

> **Nota:** Usa el puerto **3001** porque App Droopy suele ocupar el 3000.

## Supabase (produccion)

1. Crea un proyecto en Supabase
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Crea usuarios en Authentication → Users
4. Vincula jurados: `UPDATE jurados SET user_id = '<uuid>' WHERE nombre = '...'`
5. Crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Estructura

```
src/app/
  admin/          Configuracion del concurso
  jurado/         Grilla de calificacion
  resultados/     Rankings (publico)
  login/          Autenticacion
src/lib/certamen/ Servicios + agregador de puntajes
supabase/         Schema + seed UNAC 2026
```

## Reglas de puntuacion

- Escala 1–10 por criterio
- Promedio de jurados por criterio, ponderado (40/30/30)
- Puntaje total = suma de (puntaje categoria × 20%)
