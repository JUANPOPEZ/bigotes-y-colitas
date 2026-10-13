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
-- Crea la tabla 'adopciones', configura RLS, e implementa la función
-- transaccional atómica 'registrar_entrega_mascota'.
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
-- BLOQUE 2: TABLA adopciones, POLÍTICAS RLS Y FUNCIÓN RPC ATÓMICA
-- (Ejecutar después de haber ejecutado el Bloque 1)
-- ====================================================================

-- 1. Crear tabla public.adopciones para registro y seguimiento (Criterio 7)
CREATE TABLE IF NOT EXISTS public.adopciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_id UUID NOT NULL UNIQUE REFERENCES public.solicitudes_adopcion(id) ON DELETE RESTRICT,
    mascota_id UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE RESTRICT,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entregado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_entrega TIMESTAMPTZ NOT NULL DEFAULT now(),
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas de seguimiento
CREATE INDEX IF NOT EXISTS idx_adopciones_solicitud ON public.adopciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_mascota ON public.adopciones(mascota_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_usuario ON public.adopciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_fecha ON public.adopciones(fecha_entrega);

-- 2. Habilitar RLS en public.adopciones
ALTER TABLE public.adopciones ENABLE ROW LEVEL SECURITY;

-- Limpieza idempotente de políticas previas creadas por esta migración
DROP POLICY IF EXISTS "Lectura de adopciones por admin o adoptante" ON public.adopciones;

-- Política de lectura: Administradores pueden ver todas; adoptantes ven sus propias adopciones
CREATE POLICY "Lectura de adopciones por admin o adoptante"
    ON public.adopciones FOR SELECT
    USING (
        public.es_admin()
        OR (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
    );

-- Nota de seguridad: NO se definen políticas públicas de INSERT/UPDATE/DELETE.
-- La única vía de inserción es la función RPC con verificación de rol de administrador.

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

    -- 4. Criterio 6: Construir evento de cronología conservando formato exacto
    v_nuevo_evento := jsonb_build_object(
        'fecha', to_char(v_fecha_entrega, 'YYYY-MM-DD"T"HH24:MI:SSOF'),
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

-- 4. Asignación estricta de privilegios de ejecución
REVOKE EXECUTE ON FUNCTION public.registrar_entrega_mascota(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.registrar_entrega_mascota(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.registrar_entrega_mascota(UUID, TEXT) TO authenticated;
GRANT ALL ON TABLE public.adopciones TO postgres, authenticated, service_role;
