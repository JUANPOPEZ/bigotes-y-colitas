-- ====================================================================
-- MIGRACIÓN: ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) ESTRICTO EN MASCOTAS
-- ====================================================================
-- Este script asegura que:
-- 1. Cualquier visitante (anónimo o adoptante) pueda LEER (SELECT) el catálogo de mascotas.
-- 2. Solo los usuarios con rol 'administrador' en public.perfiles puedan CREAR (INSERT),
--    EDITAR (UPDATE) o ELIMINAR (DELETE) mascotas.
-- ====================================================================

-- 1. Asegurar función para verificar si el usuario autenticado es administrador
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol = 'administrador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- ====================================================================
-- COMANDOS ÚTILES PARA EL ADMINISTRADOR (Copiar y ejecutar si es necesario):
-- ====================================================================

-- Para ascender un usuario registrado a Administrador:
-- UPDATE public.perfiles SET rol = 'administrador' WHERE correo = 'tu_correo@ejemplo.com';

-- Para consultar los usuarios actuales y sus roles:
-- SELECT id, nombre, correo, rol FROM public.perfiles ORDER BY creado_en DESC;
