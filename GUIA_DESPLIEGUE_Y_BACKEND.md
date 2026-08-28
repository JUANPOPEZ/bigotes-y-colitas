# Guía de Puesta en Marcha, Supabase Backend y Despliegue en Vercel

Esta guía explica paso a paso cómo configurar la base de datos en Supabase y cómo desplegar el prototipo en Vercel para su visualización y sustentación.

---

## 1. Configuración del Backend en Supabase (Sprint 1)

### Paso 1.1: Crear el proyecto en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión con tu cuenta de GitHub o correo.
2. Haz clic en **"New Project"**.
3. Asigna un nombre al proyecto (ej. `bigotes-y-colitas-backend`), define una contraseña segura para la base de datos y selecciona la región más cercana (ej. `East US` / `South America`).
4. Haz clic en **"Create new project"** y espera ~2 minutos a que se aprovisione.

### Paso 1.2: Obtener las credenciales de conexión
1. En el panel lateral izquierdo de Supabase, ve a **Project Settings** (ícono de engranaje) > **API**.
2. Copia los siguientes valores:
   - **Project URL** (ej. `https://xyzcompany.supabase.co`)
   - **Project API Anon Key** (la clave pública `eyJhbGciOi...`)
3. Pega estos valores en tu archivo `.env` local:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

### Paso 1.3: Ejecutar las Migraciones SQL
En el panel lateral de Supabase, haz clic en **SQL Editor** y ejecuta los scripts en el siguiente orden:

1. **Migración 1 (Esquema Inicial):**
   - Abre el archivo `supabase/migrations/20260828000000_schema_inicial.sql`.
   - Copia todo su contenido, pégalo en el SQL Editor de Supabase y presiona **"Run"** (Ctrl + Enter).
   - *Crea los tipos ENUM, tablas con UUIDs, llaves foráneas, índices y triggers.*

2. **Migración 2 (Políticas RLS):**
   - Abre el archivo `supabase/migrations/20260828000001_rls_politicas.sql`.
   - Pégalo en el SQL Editor y presiona **"Run"**.
   - *Protege las tablas y restringe permisos por rol.*

3. **Migración 3 (Buckets de Storage):**
   - Abre el archivo `supabase/migrations/20260828000002_storage_buckets.sql`.
   - Pégalo en el SQL Editor y presiona **"Run"**.
   - *Crea los buckets `avatars`, `pets`, `products` y `reports_evidence` con sus permisos.*

4. **Datos Iniciales (Seed Data):**
   - Abre el archivo `supabase/seed.sql`.
   - Pégalo en el SQL Editor y presiona **"Run"**.
   - *Inserta las 28 mascotas corregidas, productos, campañas, eventos y denuncias de prueba.*

---

## 2. Despliegue del Frontend en Vercel

Para que el docente y tus compañeros puedan visualizar el prototipo en vivo:

### Opción A: Despliegue mediante GitHub y Vercel (Recomendado)
1. Sube tu proyecto a un repositorio de GitHub (o el repositorio conectado a Lovable).
2. Ve a [https://vercel.com](https://vercel.com) e inicia sesión.
3. Haz clic en **"Add New..."** > **"Project"**.
4. Selecciona tu repositorio de GitHub e impórtalo.
5. En la sección **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = (Tu URL de Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (Tu clave pública Anon Key)
6. Haz clic en **"Deploy"**. En 1 minuto tendrás la URL pública (ej. `https://bigotes-y-colitas.vercel.app`).

### Opción B: Despliegue con Vercel CLI
Si prefieres desplegar desde la terminal:
```bash
npm install -g vercel
vercel
```

---

## 3. Resumen de Correcciones Implementadas en el Prototipo

1. **Validación de campos obligatorios (`HU-01`):**
   - Se implementó en `src/components/shared/crud-module.tsx` la validación que impide guardar registros con campos requeridos en blanco.
   - En `src/routes/admin/mascotas.tsx` se marcaron como obligatorios todos los datos esenciales de la mascota.
2. **Exclusión de mascotas adoptadas en el catálogo (`HU-02`):**
   - En `src/routes/_site/mascotas/index.tsx` se excluyen automáticamente las mascotas adoptadas.
   - En el selector de filtros de estado solo aparecen estados activos de adopción.
3. **Coherencia taxonómica de imágenes (`HU-03`):**
   - En `src/mock/mascotas.ts` se corrigieron las 28 fichas: 14 perros con imágenes de perros y 14 gatos con imágenes de gatos.
