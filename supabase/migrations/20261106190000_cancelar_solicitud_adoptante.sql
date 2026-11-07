-- ====================================================================
-- MIGRACIÓN: CANCELACIÓN SEGURA DE SOLICITUDES POR ADOPTANTES
-- Proyecto: Bigotes y Colitas - Refugio Animal
-- ====================================================================
-- Permite que cualquier adoptante (actual o futuro) cancele de forma
-- autónoma y segura sus solicitudes de adopción únicamente si se encuentran
-- en estado 'Pendiente'.
--
-- REGLAS DE SEGURIDAD ESTRICTAS:
-- 1. El adoptante SOLO puede cancelar sus propias solicitudes (por usuario_id o email autenticado).
-- 2. SOLO se permite la cancelación si el estado de la solicitud es 'Pendiente'.
-- 3. La mascota asociada NUNCA es eliminada ni alterada negativamente;
--    permanece intacta y disponible para otros adoptantes.
-- 4. No otorga ningún permiso adicional sobre otras tablas ni sobre registros ajenos.
-- ====================================================================

-- 1. Política RLS para permitir eliminación directa de solicitudes en estado 'Pendiente' propias
DROP POLICY IF EXISTS "Adoptantes pueden cancelar sus solicitudes pendientes" ON public.solicitudes_adopcion;

CREATE POLICY "Adoptantes pueden cancelar sus solicitudes pendientes"
    ON public.solicitudes_adopcion FOR DELETE
    USING (
        (
            (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
            OR (auth.jwt() ->> 'email' IS NOT NULL AND LOWER(correo) = LOWER(auth.jwt() ->> 'email'))
        )
        AND estado = 'Pendiente'
    );

-- 2. Función RPC atómica para cancelar la solicitud bajo SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.cancelar_solicitud_adoptante(
    p_solicitud_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_solicitud RECORD;
    v_auth_uid UUID;
    v_auth_email TEXT;
BEGIN
    -- 1. Verificar autenticación del usuario
    v_auth_uid := auth.uid();
    v_auth_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));

    IF v_auth_uid IS NULL AND v_auth_email = '' THEN
        RAISE EXCEPTION 'Acceso denegado: debes iniciar sesión para cancelar una solicitud.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 2. Bloquear la fila de la solicitud para evitar concurrencia
    SELECT id, usuario_id, correo, estado, mascota_id
    INTO v_solicitud
    FROM public.solicitudes_adopcion
    WHERE id = p_solicitud_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La solicitud no existe o ya fue eliminada.'
            USING ERRCODE = 'no_data_found';
    END IF;

    -- 3. Verificar pertenencia estricta (no administradores solo pueden tocar sus solicitudes)
    IF NOT public.es_admin() THEN
        IF NOT (
            (v_auth_uid IS NOT NULL AND v_solicitud.usuario_id = v_auth_uid)
            OR (v_auth_email <> '' AND LOWER(v_solicitud.correo) = v_auth_email)
        ) THEN
            RAISE EXCEPTION 'Acceso denegado: no tienes permisos para cancelar esta solicitud.'
                USING ERRCODE = 'insufficient_privilege';
        END IF;
    END IF;

    -- 4. Validar estado: ÚNICAMENTE se permite cancelar en estado 'Pendiente'
    IF v_solicitud.estado <> 'Pendiente' THEN
        RAISE EXCEPTION 'Solo puedes cancelar solicitudes que se encuentren en estado Pendiente (estado actual: %).' , v_solicitud.estado
            USING ERRCODE = 'check_violation';
    END IF;

    -- 5. Eliminar la solicitud de adopción
    -- NOTA: La mascota en la tabla 'mascotas' NO se elimina en absoluto.
    DELETE FROM public.solicitudes_adopcion
    WHERE id = p_solicitud_id;

    RETURN jsonb_build_object(
        'success', true,
        'solicitud_id', p_solicitud_id,
        'mensaje', 'Solicitud de adopción cancelada exitosamente.'
    );
END;
$$;

-- 3. Permisos de ejecución
REVOKE EXECUTE ON FUNCTION public.cancelar_solicitud_adoptante(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancelar_solicitud_adoptante(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancelar_solicitud_adoptante(UUID) TO authenticated;
