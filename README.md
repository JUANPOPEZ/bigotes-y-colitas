# Bigotes y Colitas — Refugio y Gestión Animal

Sistema web integral para el refugio animal **Bigotes y Colitas**, enfocado en la adopción responsable, seguimiento de procesos, tienda solidaria, donaciones y denuncias comunitarias.

- **Stack:** React 19 + Vite 8 + TanStack Start (SSR) + TanStack Router + TailwindCSS v4 + Supabase JS.
- **Base de datos:** PostgreSQL en [Supabase](https://supabase.com).
- **Despliegue de producción:** Vercel conectado a la rama `main`.

---

## 🚀 Cómo ejecutar la aplicación en local (sin Vercel)

Si deseas probar o abrir la aplicación en tu computadora con todos los cambios implementados:

### 1. Requisitos previos
- **Node.js** (versión 18 o superior, recomendada 20+) y **npm**, o **Bun** instalado.
- Clonar o ubicarse en la carpeta raíz del repositorio:
  ```bash
  cd bigotes-y-colitas
  ```

> [!TIP]
> **En Windows:** Si al ejecutar comandos en PowerShell recibes un mensaje bloqueante de scripts (`... no se puede cargar porque la ejecución de scripts está deshabilitada`), abre una terminal con `cmd` (Símbolo del sistema) o ejecuta en PowerShell:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

### 2. Configuración de Variables de Entorno (`.env`)
Asegúrate de tener un archivo `.env` en la raíz del proyecto con la conexión a Supabase:

```env
VITE_SUPABASE_URL=https://hiaskeppprosyxxcdjap.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_1bd9-I9Rwi87Iy75JPW08w_0yl0FJ1-
```

---

### 3. Instalar dependencias
Ejecuta en tu terminal:

**Con npm:**
```bash
npm install
```

**Con bun (si lo tienes instalado):**
```bash
bun install
```

---

### 4. Iniciar el servidor local de desarrollo
Una vez instaladas las dependencias, inicia el entorno de desarrollo:

**Con npm:**
```bash
npm run dev
```

**Con bun:**
```bash
bun dev
```

La consola te indicará la URL local, normalmente:
👉 **`http://localhost:3000`** (o `http://localhost:5173`).

Abre esa dirección en tu navegador (Chrome, Edge, Firefox, etc.) y podrás utilizar la aplicación completa con todos los cambios.

---

### 5. Modo Producción Local (Build y Preview)
Si quieres probar la versión exactamente igual a cómo corre en producción:

```bash
# 1. Compilar el proyecto
npm run build

# 2. Servir el build localmente
npm run preview
```

---

## 🗄️ Nota sobre la Base de Datos (Supabase)

La aplicación se conecta en vivo a la base de datos en Supabase. Para que la radicación de solicitudes (`HU-06`) funcione sin restricciones de seguridad (RLS):

1. Ingresa al panel de Supabase: [https://supabase.com/dashboard/project/hiaskeppprosyxxcdjap](https://supabase.com/dashboard/project/hiaskeppprosyxxcdjap).
2. Ve al **SQL Editor** (`>_`).
3. Copia y ejecuta el contenido del archivo:
   `supabase/migrations/20260929000000_solicitudes_adopcion_hu06.sql`
4. Esto creará la secuencia de radicado único (`SOL-2026-XXXXXX`), el trigger del límite de 3 solicitudes activas y las políticas de acceso RLS.

---

## 📋 Scripts Disponibles en `package.json`

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR). |
| `npm run build` | Compila el proyecto con SSR optimizado para despliegue. |
| `npm run preview` | Previsualiza localmente el build de producción generado. |
| `npm run lint` | Analiza el código en busca de errores con ESLint. |
| `npm run format` | Da formato a todo el código fuente con Prettier. |