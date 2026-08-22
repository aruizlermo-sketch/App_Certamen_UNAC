# Base de datos — Certamen UNAC

## Instalacion nueva

En **Supabase → SQL Editor**, ejecutar en orden:

1. `schema.sql` — tablas, indices, seed UNAC 2026
2. `policies.sql` — RLS, vinculacion por email, presidente del jurado

## Migracion desde scripts antiguos

Si ya ejecutaste `roles-rls.sql`, `link-by-email.sql` o `presidente-jurado.sql`:

- Ejecuta solo **`policies.sql`** (reemplaza funciones y politicas de forma idempotente).

## Archivos obsoletos (no usar en instalaciones nuevas)

| Archivo | Reemplazado por |
|---------|-----------------|
| `roles-rls.sql` | `policies.sql` |
| `link-by-email.sql` | `policies.sql` |
| `presidente-jurado.sql` | `policies.sql` |
| `fix-link-jurado-email.sql` | `policies.sql` |

## Primer admin

1. En la app: **Admin → Accesos** → agregar email del administrador.
2. Ese usuario entra con Google o email/contraseña; se vincula automaticamente como admin.

## Primer jurado

1. **Admin → Jurados** → crear jurado con **email de acceso**.
2. El jurado entra con ese correo; la app vincula `user_id` automaticamente.

## Resetear vinculo incorrecto

```sql
UPDATE jurados SET user_id = NULL
WHERE lower(trim(email)) = 'correo@ejemplo.com';
```

Luego el jurado vuelve a iniciar sesion.

## Seguridad

- **No ejecutar solo `schema.sql` en produccion** sin `policies.sql`: las tablas quedan sin politicas utiles.
- El rol admin **solo** se asigna via `admin_invites` + `link_user_by_email`, no via metadata de signup.
