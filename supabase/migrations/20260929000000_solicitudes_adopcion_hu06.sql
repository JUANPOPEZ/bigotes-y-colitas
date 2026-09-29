-- ====================================================================
-- MIGRACIÓN: HU-06 — SOLICITUDES DE ADOPCIÓN Y RADICADO ÚNICO
-- Proyecto: Bigotes y Colitas - Refugio Animal
-- ====================================================================
-- Esta migración asegura:
-- 1. La tabla public.solicitudes_adopcion con todas sus columnas y restricciones.
-- 2. Secuencia y función para generación de radicado único legible (SOL-YYYY-XXXXXX).
-- 3. Trigger en PostgreSQL para validar el límite estricto de máximo 3 solicitudes activas por usuario.
-- 4. Políticas de Row Level Security (RLS) para inserción y lectura por usuario y admin.
-- ====================================================================

-- 1. Asegurar tipos necesarios
DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM (
        'Pendiente', 'En revisión', 'Entrevista', 'Visita', 'Aprobada', 'Entregado', 'Rechazada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Secuencia para radicados de solicitudes
CREATE SEQUENCE IF NOT EXISTS public.radicado_solicitud_seq START WITH 101;

-- 3. Función generadora de radicado único (ej. SOL-2026-000101)
CREATE OR REPLACE FUNCTION public.generar_radicado_solicitud()
RETURNS TEXT AS $$
DECLARE
    v_ano TEXT := to_char(now(), 'YYYY');
    v_seq BIGINT;
BEGIN
    v_seq := nextval('public.radicado_solicitud_seq');
    RETURN 'SOL-' || v_ano || '-' || lpad(v_seq::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 4. Crear o actualizar la tabla solicitudes_adopcion
CREATE TABLE IF NOT EXISTS public.solicitudes_adopcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    radicado TEXT UNIQUE,
    mascota_id UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    solicitante TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    ciudad TEXT NOT NULL,
    estado estado_solicitud NOT NULL DEFAULT 'Pendiente',
    datos_hogar JSONB DEFAULT '{}'::jsonb,
    datos_formulario JSONB DEFAULT '{}'::jsonb,
    cronologia JSONB NOT NULL DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.1 Asegurar que existan las nuevas columnas si la tabla ya había sido creada previamente
ALTER TABLE public.solicitudes_adopcion ADD COLUMN IF NOT EXISTS radicado TEXT;
ALTER TABLE public.solicitudes_adopcion ADD COLUMN IF NOT EXISTS datos_formulario JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.solicitudes_adopcion ADD COLUMN IF NOT EXISTS datos_hogar JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.solicitudes_adopcion ADD COLUMN IF NOT EXISTS cronologia JSONB DEFAULT '[]'::jsonb;

-- Configurar valor por defecto para radicado
ALTER TABLE public.solicitudes_adopcion ALTER COLUMN radicado SET DEFAULT public.generar_radicado_solicitud();

-- Generar radicados a filas existentes que no tengan
UPDATE public.solicitudes_adopcion
SET radicado = public.generar_radicado_solicitud()
WHERE radicado IS NULL OR radicado = '';

-- Crear índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_solicitudes_radicado ON public.solicitudes_adopcion(radicado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON public.solicitudes_adopcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_mascota ON public.solicitudes_adopcion(mascota_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_adopcion(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_correo ON public.solicitudes_adopcion(correo);

-- 5. Trigger de validación de límite de 3 solicitudes activas y auto-asignación de radicado
CREATE OR REPLACE FUNCTION public.validar_limite_solicitudes_activas()
RETURNS TRIGGER AS $$
DECLARE
    v_activas INTEGER;
    v_user_id UUID;
    v_correo TEXT;
BEGIN
    v_user_id := NEW.usuario_id;
    v_correo := NEW.correo;

    -- Contar solicitudes activas del mismo usuario (por ID de auth o por correo electrónico)
    SELECT COUNT(*)
    INTO v_activas
    FROM public.solicitudes_adopcion
    WHERE (
        (v_user_id IS NOT NULL AND usuario_id = v_user_id)
        OR (v_correo IS NOT NULL AND LOWER(correo) = LOWER(v_correo))
    )
    AND estado IN ('Pendiente', 'En revisión', 'Entrevista', 'Visita');

    IF v_activas >= 3 THEN
        RAISE EXCEPTION 'El usuario ya cuenta con 3 o más solicitudes activas en proceso de adopción. Debe esperar a que se resuelva alguna para postular una nueva.'
            USING ERRCODE = 'check_violation';
    END IF;

    -- Si no se proporcionó radicado, generarlo automáticamente
    IF NEW.radicado IS NULL OR NEW.radicado = '' THEN
        NEW.radicado := public.generar_radicado_solicitud();
    END IF;

    -- Asegurar estado inicial 'Pendiente' si viene nulo
    IF NEW.estado IS NULL THEN
        NEW.estado := 'Pendiente';
    END IF;

    -- Inicializar cronología con el primer evento si viene vacía
    IF NEW.cronologia IS NULL OR NEW.cronologia = '[]'::jsonb THEN
        NEW.cronologia := jsonb_build_array(
            jsonb_build_object(
                'fecha', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SSOF'),
                'titulo', 'Solicitud radicada',
                'detalle', 'Solicitud de adopción recibida exitosamente en estado Pendiente.'
            )
        );
    END IF;

    -- Asegurar sincronización entre datos_formulario y datos_hogar
    IF (NEW.datos_formulario IS NOT NULL AND NEW.datos_formulario <> '{}'::jsonb) AND (NEW.datos_hogar IS NULL OR NEW.datos_hogar = '{}'::jsonb) THEN
        NEW.datos_hogar := NEW.datos_formulario;
    ELSIF (NEW.datos_hogar IS NOT NULL AND NEW.datos_hogar <> '{}'::jsonb) AND (NEW.datos_formulario IS NULL OR NEW.datos_formulario = '{}'::jsonb) THEN
        NEW.datos_formulario := NEW.datos_hogar;
    END IF;

    NEW.actualizado_en := now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS tr_validar_limite_solicitudes ON public.solicitudes_adopcion;
CREATE TRIGGER tr_validar_limite_solicitudes
    BEFORE INSERT ON public.solicitudes_adopcion
    FOR EACH ROW
    EXECUTE FUNCTION public.validar_limite_solicitudes_activas();

-- 6. Configuración de Row Level Security (RLS)
ALTER TABLE public.solicitudes_adopcion ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas
DROP POLICY IF EXISTS "Cualquiera puede enviar una solicitud de adopcion" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Usuarios autenticados ven sus propias solicitudes" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Admins pueden actualizar solicitudes de adopcion" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Admins pueden eliminar solicitudes de adopcion" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Usuarios pueden crear solicitudes de adopcion" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Usuarios ven sus solicitudes y admins todas" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Permitir crear solicitudes de adopcion" ON public.solicitudes_adopcion;
DROP POLICY IF EXISTS "Lectura de solicitudes propias o admin" ON public.solicitudes_adopcion;

-- Inserción: Permitir que cualquier usuario o adoptante registre su solicitud
CREATE POLICY "Permitir crear solicitudes de adopcion"
    ON public.solicitudes_adopcion FOR INSERT
    WITH CHECK (true);

-- Lectura: Los usuarios ven sus propias solicitudes (por usuario_id o anónimas de su sesión) y los administradores ven todas
CREATE POLICY "Lectura de solicitudes propias o admin"
    ON public.solicitudes_adopcion FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
        OR usuario_id IS NULL
        OR public.es_admin()
        OR auth.role() = 'anon'
    );

-- Actualización: Exclusivo para administradores
CREATE POLICY "Admins pueden actualizar solicitudes de adopcion"
    ON public.solicitudes_adopcion FOR UPDATE
    USING (public.es_admin());

-- Eliminación: Exclusivo para administradores
CREATE POLICY "Admins pueden eliminar solicitudes de adopcion"
    ON public.solicitudes_adopcion FOR DELETE
    USING (public.es_admin());

-- Permisos sobre tabla y secuencia
GRANT ALL ON TABLE public.solicitudes_adopcion TO postgres, authenticated, anon, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.radicado_solicitud_seq TO postgres, authenticated, anon, service_role;
