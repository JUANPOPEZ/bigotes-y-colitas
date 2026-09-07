# Contexto Completo y Bitácora Técnica — Bigotes y Colitas

Este documento contiene **toda la información técnica, historial de incidencias resueltas, arquitectura e instrucciones de despliegue** del proyecto *Bigotes y Colitas*. Permite a cualquier desarrollador o agente de IA continuar el trabajo sin ambigüedades ni pérdida de contexto.

---

## 1. Conexión de Servicios y Arquitectura

### GitHub → Vercel
- **Repositorio oficial:** `https://github.com/JUANPOPEZ/bigotes-y-colitas.git`
- **Rama principal:** `main`
- **Integración:** Vercel está conectado directamente a este repositorio. Cada `push` a `main` activa un build y despliegue automático en:
  `https://bigotes-y-colitas.vercel.app`
- **Nota de Git:** En la máquina local Windows, el *Git Credential Manager* puede tener en caché otra cuenta (`NkAlejandro`). El flujo seguro y probado de subida es mediante **GitHub Desktop** conectado a la cuenta `JUANPOPEZ`.
- **Regla Lovable:** Este proyecto proviene originalmente de Lovable.dev (`@lovable.dev/vite-tanstack-config`). **Nunca reescribir historial de Git** (evitar `git push --force`, rebase o squashing de commits publicados).

### Supabase
- **Proyecto Supabase:** "bigotes-y-colitas"
- **URL Oficial:** `https://hiaskeppprosyxxcdjap.supabase.co`
- **Anon Key (Pública):** `sb_publishable_1bd9-I9Rwi87Iy75JPW08w_0yl0FJ1-`
- **Naturaleza de las llaves:** La clave anónima (`sb_publishable_...`) y la URL son públicas por diseño en Supabase. Se envían en texto plano en las cabeceras HTTP del cliente. La seguridad y protección de datos se gestiona a través de **Row Level Security (RLS)** en PostgreSQL.

---

## 2. Historial Cronológico de Problemas y Soluciones

### Incidencia 1: Persistencia de datos simulados (mocks)
- **Problema:** La aplicación no guardaba datos en la base de datos real, utilizaba una capa de mocks locales.
- **Solución:** Se conectó `src/lib/services/mascotas.ts` directamente al cliente de Supabase (`supabase.from("mascotas")`) y se eliminó el fallback que mostraba mocks si la consulta fallaba.

### Incidencia 2: Error 500 en Vercel (SSR) — `supabaseUrl is required`
- **Problema:** Al renderizar del lado del servidor en Vercel (`_ssr`), `import.meta.env` no contiene las variables `VITE_*`.
- **Solución:** En `src/lib/supabase.ts`, se configuró la lectura dual: revisar `import.meta.env` (para Vite/cliente) y `process.env` (para runtime de Node en SSR).

### Incidencia 3: Target por defecto de Nitro en Cloudflare
- **Problema:** El build generaba archivos para Cloudflare Workers en vez de Vercel.
- **Solución:** En `vite.config.ts`, se configuró explícitamente `vite: { nitro: { preset: "vercel" } }`, logrando la salida limpia `.vercel/output`.

### Incidencia 4: Error `net::ERR_NAME_NOT_RESOLVED` con `placeholder.supabase.co`
- **Causa raíz descubierta:** Se había implementado una función `leerEnv(nombre)` con acceso dinámico (`import.meta.env[nombre]`). En Vite para producción, las variables de entorno **solo se inyectan mediante reemplazo estático de texto en tiempo de compilación** (`import.meta.env.VITE_*`). El acceso dinámico fue ignorado por Vite; en el navegador `process` no existe, por lo que el URL quedaba en blanco y caía en el fallback `"https://placeholder.supabase.co"`.
- **Solución:**
  1. Se eliminó por completo `placeholder.supabase.co` de todo el proyecto.
  2. En `src/lib/supabase.ts`, se definieron como respaldo las credenciales públicas oficiales del proyecto.
  3. En `vite.config.ts`, se agregó la directiva `define` para forzar la inyección estática de `import.meta.env.VITE_SUPABASE_*` en el bundle del cliente.

---

## 3. Estado de la Base de Datos y RLS (Row Level Security)

### Tablas Principales
- `public.mascotas`: Catálogo de mascotas (id UUID, nombre, especie, raza, sexo, edad, peso, tamaño, ciudad, estado, historia, salud, galería, etc.).
- `public.perfiles`: Perfiles de usuario vinculados a `auth.users(id)` con campo `rol` (`'administrador'` | `'adoptante'`).
- `public.solicitudes_adopcion`, `public.donaciones`, `public.campanas`, `public.productos`, `public.pedidos`, `public.eventos`, `public.denuncias`.

### Diagnóstico de RLS
- El archivo de migración `supabase/migrations/20260828000001_rls_politicas.sql` y la nueva migración `supabase/migrations/20260907000000_activar_rls_estricto.sql` definen:
  - Lectura pública del catálogo de mascotas (`SELECT USING (true)`).
  - Mutaciones (`INSERT`, `UPDATE`, `DELETE`) reservadas exclusivamente a administradores mediante la función `public.es_admin()`:
    ```sql
    CREATE OR REPLACE FUNCTION public.es_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'administrador'
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
- Para activar la seguridad estricta en Supabase, basta con abrir el **SQL Editor** de Supabase y ejecutar el script `supabase/migrations/20260907000000_activar_rls_estricto.sql`.

---

## 4. Autenticación Real y Roles Implementados

### Módulos Conectados:
1. **`src/lib/auth.ts`:**
   - Servicio central de autenticación con Supabase (`supabase.auth.signInWithPassword`, `signUp`, `signOut`, `getSession`, `onAuthStateChange`).
   - Hook `useAuth()` que expone `user`, `session`, `perfil`, `rol` (`'visitante'` | `'adoptante'` | `'administrador'`), `autenticado`, `cargando`.
2. **`src/routes/auth/login.tsx`:**
   - Formulario de login real conectado a Supabase Auth.
   - Redirección condicional:
     - Rol `'administrador'` → Redirige automáticamente a `/admin`.
     - Rol `'adoptante'` → Redirige a `/cuenta`.
   - Botones de exploración rápida (demo) preservados para pruebas y evaluaciones sin conexión obligatoria.
3. **`src/routes/auth/registro.tsx`:**
   - Formulario conectado a `supabase.auth.signUp`.
   - Asigna rol `'adoptante'` y dispara el trigger `handle_new_user()` que crea el registro en `public.perfiles`.
4. **`src/routes/admin.tsx`:**
   - Layout del panel administrativo protegido: si un usuario con rol distinto a `'administrador'` intenta ingresar, muestra pantalla de "Acceso Restringido" y botón para volver a su panel de adoptante.
5. **`src/components/layout/navbar.tsx`:**
   - Muestra el nombre real, iniciales y badge del rol (`Administrador` o `Adoptante`) del usuario logueado.
   - Botón "Cerrar sesión" funcional que llama a `supabase.auth.signOut()`.
