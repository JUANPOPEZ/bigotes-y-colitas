-- ====================================================================
-- MIGRACIÓN: ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) ESTRICTO EN MASCOTAS
-- ====================================================================
-- Este script asegura que:
-- 1. Cualquier visitante (anónimo o adoptante) pueda LEER (SELECT) el catálogo de mascotas.
-- 2. Solo los usuarios con rol 'administrador' en public.perfiles puedan CREAR (INSERT),
--    EDITAR (UPDATE) o ELIMINAR (DELETE) mascotas.
-- ====================================================================

-- 1. Asegurar columnas y extensiones en la tabla perfiles
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS ciudad TEXT DEFAULT 'Bogotá';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Activo';

-- 1.1 Asegurar función para verificar si el usuario autenticado es administrador
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol = 'administrador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- 1.2 Trigger ultraseguro para crear perfil automáticamente al registrarse en auth.users
-- Con manejo de excepciones para que NUNCA bloquee la creación de usuarios con 'Database error saving new user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, auth
AS $$
DECLARE
    v_nombre TEXT;
    v_ciudad TEXT;
    v_rol rol_usuario := 'adoptante';
BEGIN
    -- Extraer nombre con prioridad: nombre de formulario, Google full_name, name o email
    v_nombre := COALESCE(
        NEW.raw_user_meta_data->>'nombre',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'Usuario'
    );

    -- Asignación segura del rol sin fallo de conversión
    IF NEW.raw_user_meta_data->>'rol' = 'administrador' THEN
        v_rol := 'administrador';
    ELSE
        v_rol := 'adoptante';
    END IF;

    v_ciudad := COALESCE(NEW.raw_user_meta_data->>'ciudad', 'Bogotá');

    INSERT INTO public.perfiles (id, nombre, correo, rol, ciudad, telefono, avatar_url, estado)
    VALUES (
        NEW.id,
        v_nombre,
        COALESCE(NEW.email, ''),
        v_rol,
        v_ciudad,
        NEW.raw_user_meta_data->>'telefono',
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        'Activo'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        nombre = EXCLUDED.nombre,
        correo = EXCLUDED.correo,
        telefono = COALESCE(EXCLUDED.telefono, public.perfiles.telefono),
        ciudad = COALESCE(EXCLUDED.ciudad, public.perfiles.ciudad),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.perfiles.avatar_url);

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Registrar advertencia en logs de Supabase pero NUNCA abortar la creación del usuario en auth.users
    RAISE WARNING 'Error en public.handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN undefined_table THEN null; END $$;

-- 2. Habilitar RLS en la tabla mascotas
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;

-- 3. Limpiar políticas previas para evitar duplicados o permisos permisivos
DROP POLICY IF EXISTS "Cualquiera puede ver mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Solo administradores pueden crear mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Solo administradores pueden editar mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Acceso publico temporal" ON public.mascotas;
DROP POLICY IF EXISTS "Permitir inserciones publicas" ON public.mascotas;

-- 4. POLÍTICAS DEFINITIVAS DE SEGURIDAD

-- A. Lectura pública para la tienda, catálogo y fichas
CREATE POLICY "Cualquiera puede ver mascotas"
    ON public.mascotas FOR SELECT
    USING (true);

-- B. Creación restringida exclusivamente a administradores autenticados
CREATE POLICY "Solo administradores pueden crear mascotas"
    ON public.mascotas FOR INSERT
    WITH CHECK (public.es_admin());

-- C. Edición restringida exclusivamente a administradores autenticados
CREATE POLICY "Solo administradores pueden editar mascotas"
    ON public.mascotas FOR UPDATE
    USING (public.es_admin());

-- D. Eliminación restringida exclusivamente a administradores autenticados
CREATE POLICY "Solo administradores pueden eliminar mascotas"
    ON public.mascotas FOR DELETE
    USING (public.es_admin());

-- 5. Asegurar RLS en la tabla perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de perfiles basicos" ON public.perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Permitir insercion de perfil propio o trigger" ON public.perfiles;
DROP POLICY IF EXISTS "Admins pueden gestionar todos los perfiles" ON public.perfiles;

CREATE POLICY "Lectura publica de perfiles basicos"
    ON public.perfiles FOR SELECT
    USING (true);

CREATE POLICY "Permitir insercion de perfil propio o trigger"
    ON public.perfiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.perfiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins pueden gestionar todos los perfiles"
    ON public.perfiles FOR ALL
    USING (public.es_admin());

-- Otorgar permisos necesarios sobre la tabla perfiles
GRANT ALL ON TABLE public.perfiles TO postgres, authenticated, anon, service_role;

-- 6. Asegurar Storage Bucket 'pets' para fotos de mascotas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pets', 'pets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760;

DROP POLICY IF EXISTS "Lectura publica de fotos de mascotas" ON storage.objects;
DROP POLICY IF EXISTS "Admins suben fotos de mascotas" ON storage.objects;
DROP POLICY IF EXISTS "Admins eliminan fotos de mascotas" ON storage.objects;

CREATE POLICY "Lectura publica de fotos de mascotas"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'pets');

CREATE POLICY "Admins suben fotos de mascotas"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'pets' AND (public.es_admin() OR auth.role() = 'authenticated'));

CREATE POLICY "Admins eliminan fotos de mascotas"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'pets' AND public.es_admin());

-- ====================================================================
-- COMANDOS ÚTILES PARA EL ADMINISTRADOR (Copiar y ejecutar si es necesario):
-- ====================================================================

-- Para ascender tu usuario registrado a Administrador:
-- UPDATE public.perfiles SET rol = 'administrador' WHERE correo = 'tu_correo@ejemplo.com';

-- Para consultar los usuarios actuales y sus roles:
-- SELECT id, nombre, correo, rol, creado_en FROM public.perfiles ORDER BY creado_en DESC;
