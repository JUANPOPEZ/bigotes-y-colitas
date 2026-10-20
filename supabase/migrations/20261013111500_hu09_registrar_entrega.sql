-- ====================================================================
-- MIGRACIÓN: HU-09 — REGISTRAR ENTREGA DE MASCOTA
-- Proyecto: Bigotes y Colitas - Refugio Animal
-- ====================================================================
-- INSTRUCCIONES DE EJECUCIÓN EN EL SQL EDITOR DE SUPABASE:
--
-- Esta migración está dividida en DOS BLOQUES:
--
-- BLOQUE 1 (Ejecutar PRIMERO y por separado si aplica):
-- Añade el valor 'Entregado' al enum si aún no existiera. En PostgreSQL,
-- una adición de valor a un ENUM no puede usarse en la misma transacción.
--
-- BLOQUE 2 (Ejecutar DESPUÉS):
-- Crea la tabla 'adopciones', actualiza foreign key a CASCADE, configura RLS,
-- e implementa las funciones 'registrar_entrega_mascota' y 'eliminar_solicitud_admin'.
-- ====================================================================

-- ====================================================================
-- BLOQUE 1: ASEGURAR VALOR 'Entregado' EN ENUM estado_solicitud
-- (Ejecutar primero y por separado)
-- ====================================================================
DO $$ BEGIN
    ALTER TYPE public.estado_solicitud ADD VALUE IF NOT EXISTS 'Entregado';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- BLOQUE 2: TABLA adopciones, POLÍTICAS RLS Y FUNCIONES RPC ATÓMICAS
-- (Ejecutar después de haber ejecutado el Bloque 1)
-- ====================================================================

-- 0. Garantizar que todos los administradores (perfiles o user_metadata) sean reconocidos
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND LOWER(rol::text) = 'administrador'
    ) OR (
        COALESCE(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'administrador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Crear tabla public.adopciones para registro y seguimiento (Criterio 7)
CREATE TABLE IF NOT EXISTS public.adopciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL UNIQUE REFERENCES public.solicitudes_adopcion(id) ON DELETE CASCADE,
    mascota_id UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE RESTRICT,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entregado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_entrega TIMESTAMPTZ NOT NULL DEFAULT now(),
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actualizar clave foránea a CASCADE en tablas preexistentes
DO $$ BEGIN
    ALTER TABLE public.adopciones DROP CONSTRAINT IF EXISTS adopciones_solicitud_id_fkey;
    ALTER TABLE public.adopciones ADD CONSTRAINT adopciones_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_adopcion(id) ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Índices para optimizar consultas de seguimiento
CREATE INDEX IF NOT EXISTS idx_adopciones_solicitud ON public.adopciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_mascota ON public.adopciones(mascota_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_usuario ON public.adopciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_fecha ON public.adopciones(fecha_entrega);

-- 2. Habilitar RLS en public.adopciones
ALTER TABLE public.adopciones ENABLE ROW LEVEL SECURITY;

-- Limpieza idempotente de políticas previas creadas por esta migración
DROP POLICY IF EXISTS "Lectura de adopciones por admin o adoptante" ON public.adopciones;
DROP POLICY IF EXISTS "Eliminación de adopciones por admin" ON public.adopciones;

-- Política de lectura: Administradores pueden ver todas; adoptantes ven sus propias adopciones
CREATE POLICY "Lectura de adopciones por admin o adoptante"
    ON public.adopciones FOR SELECT
    USING (
        public.es_admin()
        OR (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
    );

-- Política de eliminación: Administradores pueden eliminar adopciones al purgar solicitudes
CREATE POLICY "Eliminación de adopciones por admin"
    ON public.adopciones FOR DELETE
    USING (public.es_admin());

-- 3. Función atómica para registrar entrega de mascota (Criterios 1, 3, 4, 5, 6 y 7)
CREATE OR REPLACE FUNCTION public.registrar_entrega_mascota(
    p_solicitud_id UUID,
    p_observaciones TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_solicitud RECORD;
    v_adopcion_id UUID;
    v_fecha_entrega TIMESTAMPTZ := now();
    v_nuevo_evento JSONB;
BEGIN
    -- 1. Verificar que quien ejecuta es administrador
    IF NOT public.es_admin() THEN
        RAISE EXCEPTION 'Acceso denegado: solo los administradores pueden registrar la entrega de mascotas.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 2. Bloquear la fila de la solicitud para evitar condiciones de carrera (concurrencia)
    SELECT * INTO v_solicitud
    FROM public.solicitudes_adopcion
    WHERE id = p_solicitud_id
    FOR UPDATE;

    -- Verificar que la solicitud existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La solicitud con ID % no fue encontrada.', p_solicitud_id
            USING ERRCODE = 'no_data_found';
    END IF;

    -- 3. Criterio 1: Solo se puede entregar si está en estado 'Aprobada'
    IF v_solicitud.estado <> 'Aprobada' THEN
        RAISE EXCEPTION 'Solo se puede registrar la entrega de solicitudes en estado Aprobada. Estado actual: %', v_solicitud.estado
            USING ERRCODE = 'check_violation';
    END IF;

    -- 4. Criterio 6: Construir evento de cronología conservando formato exacto ISO UTC
    v_nuevo_evento := jsonb_build_object(
        'fecha', to_char(v_fecha_entrega AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'titulo', 'Entrega de mascota registrada',
        'detalle', COALESCE(NULLIF(trim(p_observaciones), ''), 'Entrega formal de la mascota completada exitosamente.')
    );

    -- 5. Criterio 4: Actualizar solicitud a estado 'Entregado'
    UPDATE public.solicitudes_adopcion
    SET
        estado = 'Entregado',
        cronologia = COALESCE(cronologia, '[]'::jsonb) || jsonb_build_array(v_nuevo_evento),
        actualizado_en = v_fecha_entrega
    WHERE id = p_solicitud_id;

    -- 6. Criterio 5: Actualizar mascota al estado exacto 'Adoptado'
    UPDATE public.mascotas
    SET
        estado = 'Adoptado',
        actualizado_en = v_fecha_entrega
    WHERE id = v_solicitud.mascota_id;

    -- 7. Criterio 7: Registrar formalmente en la tabla 'adopciones' (UNIQUE en solicitud_id previene duplicados)
    INSERT INTO public.adopciones (
        solicitud_id,
        mascota_id,
        usuario_id,
        entregado_por,
        fecha_entrega,
        observaciones
    ) VALUES (
        v_solicitud.id,
        v_solicitud.mascota_id,
        v_solicitud.usuario_id,
        auth.uid(),
        v_fecha_entrega,
        NULLIF(trim(p_observaciones), '')
    )
    RETURNING id INTO v_adopcion_id;

    -- 8. Retornar resultado
    RETURN jsonb_build_object(
        'success', true,
        'adopcion_id', v_adopcion_id,
        'solicitud_id', v_solicitud.id,
        'radicado', v_solicitud.radicado,
        'mascota_id', v_solicitud.mascota_id,
        'fecha_entrega', v_fecha_entrega,
        'mensaje', 'Entrega de mascota registrada exitosamente'
    );
END;
$$;

-- 4. Asignación estricta de privilegios de ejecución para registrar_entrega_mascota
REVOKE EXECUTE ON FUNCTION public.registrar_entrega_mascota(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.registrar_entrega_mascota(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.registrar_entrega_mascota(UUID, TEXT) TO authenticated;
GRANT ALL ON TABLE public.adopciones TO postgres, authenticated, service_role;

-- 5. Función administrativa para purgar/eliminar una solicitud de adopción y sus datos dependientes
CREATE OR REPLACE FUNCTION public.eliminar_solicitud_admin(
    p_solicitud_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    IF NOT public.es_admin() THEN
        RAISE EXCEPTION 'Acceso denegado: solo los administradores pueden eliminar solicitudes.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    DELETE FROM public.adopciones WHERE solicitud_id = p_solicitud_id;
    DELETE FROM public.solicitudes_adopcion WHERE id = p_solicitud_id;

    RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.eliminar_solicitud_admin(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.eliminar_solicitud_admin(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.eliminar_solicitud_admin(UUID) TO authenticated;
