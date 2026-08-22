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
2. Ejecuta en el SQL Editor, **en orden**:
   - `supabase/schema.sql`
   - `supabase/policies.sql`
3. Crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

4. Primer admin: **Admin → Accesos** → agregar email → entrar con **Google**
5. Jurados: **Admin → Jurados** → email de acceso → el jurado entra con Google
6. Supabase: desactivar login email/contrasena; habilitar solo Google OAuth

Ver `supabase/README.md` para migraciones y troubleshooting.

## Estructura

```
src/
  app/              Rutas (admin, jurado, resultados, login)
  components/       UI por dominio
  lib/
    auth/           Sesion, permisos, guards
    certamen/       Servicios, agregador, mappers, mock
    result.ts       Tipos de resultado compartidos
    validators.ts   Validacion de inputs
  types/            Dominio + auth
supabase/
  schema.sql        DDL + seed
  policies.sql      RLS + vinculacion email + presidente
```

## Reglas de puntuacion

- Escala 1–10 por criterio
- Promedio de jurados por criterio, ponderado (40/30/30)
- Puntaje total = suma de (puntaje categoria × 20%)

## Roles

| Rol | Acceso |
|-----|--------|
| admin | Configuracion, CRUD, calificar como jurado, resultados, notas jurados |
| jurado | Calificar y ver resultados (solo lectura) |
| presidente | Jurado + notas de todos los jurados + descargar PDF |
