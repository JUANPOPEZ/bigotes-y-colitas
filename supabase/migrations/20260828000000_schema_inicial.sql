-- ====================================================================
-- MIGRACIÓN 1: ESQUEMA INICIAL DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- Proyecto: Bigotes y Colitas - Refugio Animal
-- ====================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipos ENUM personalizados
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('visitante', 'adoptante', 'administrador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_mascota AS ENUM ('Disponible', 'En proceso', 'Adoptado', 'En tratamiento');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE especie_mascota AS ENUM ('Perro', 'Gato');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sexo_mascota AS ENUM ('Macho', 'Hembra');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tamano_mascota AS ENUM ('Pequeño', 'Mediano', 'Grande');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE energia_mascota AS ENUM ('Baja', 'Media', 'Alta');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM (
        'Pendiente', 'En revisión', 'Entrevista', 'Visita', 'Aprobada', 'Entregado', 'Rechazada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_donacion AS ENUM (
        'Dinero', 'Alimentos', 'Medicamentos', 'Juguetes', 'Cobijas', 'Accesorios'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_donacion AS ENUM ('Recibida', 'Pendiente', 'En tránsito');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_pedido AS ENUM ('Pendiente', 'Preparando', 'Enviado', 'Entregado', 'Cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prioridad_denuncia AS ENUM ('Alta', 'Media', 'Baja');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_denuncia AS ENUM (
        'Recibida', 'En revisión', 'Verificación en campo', 'Atendida', 'Cerrada', 'Descartada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Perfiles de Usuario (Sincronizada con auth.users)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    rol rol_usuario NOT NULL DEFAULT 'adoptante',
    ciudad TEXT NOT NULL DEFAULT 'Bogotá',
    telefono TEXT,
    avatar_url TEXT,
    estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla de Mascotas
CREATE TABLE IF NOT EXISTS public.mascotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    especie especie_mascota NOT NULL,
    raza TEXT NOT NULL,
    sexo sexo_mascota NOT NULL,
    edad TEXT NOT NULL,
    edad_meses INTEGER NOT NULL CHECK (edad_meses >= 0),
    peso NUMERIC(5,2) NOT NULL CHECK (peso >= 0),
    tamano tamano_mascota NOT NULL,
    ciudad TEXT NOT NULL,
    estado estado_mascota NOT NULL DEFAULT 'Disponible',
    esterilizado BOOLEAN NOT NULL DEFAULT false,
    vacunado BOOLEAN NOT NULL DEFAULT false,
    compatible_ninos BOOLEAN NOT NULL DEFAULT true,
    compatible_mascotas BOOLEAN NOT NULL DEFAULT true,
    necesidades_especiales BOOLEAN NOT NULL DEFAULT false,
    energia energia_mascota NOT NULL DEFAULT 'Media',
    personalidad TEXT[] NOT NULL DEFAULT '{}',
    historia TEXT NOT NULL,
    salud TEXT NOT NULL DEFAULT '',
    vacunas JSONB NOT NULL DEFAULT '[]'::jsonb,
    galeria TEXT[] NOT NULL DEFAULT '{}',
    destacada BOOLEAN NOT NULL DEFAULT false,
    ingreso_fecha TEXT NOT NULL DEFAULT to_char(now(), 'DD/MM/YYYY'),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas de catálogo
CREATE INDEX IF NOT EXISTS idx_mascotas_estado ON public.mascotas(estado);
CREATE INDEX IF NOT EXISTS idx_mascotas_especie ON public.mascotas(especie);
CREATE INDEX IF NOT EXISTS idx_mascotas_ciudad ON public.mascotas(ciudad);
CREATE INDEX IF NOT EXISTS idx_mascotas_destacada ON public.mascotas(destacada);

-- 5. Tabla de Solicitudes de Adopción
CREATE TABLE IF NOT EXISTS public.solicitudes_adopcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mascota_id UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    solicitante TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    ciudad TEXT NOT NULL,
    estado estado_solicitud NOT NULL DEFAULT 'Pendiente',
    datos_hogar JSONB DEFAULT '{}'::jsonb,
    cronologia JSONB NOT NULL DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON public.solicitudes_adopcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_mascota ON public.solicitudes_adopcion(mascota_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudes_adopcion(estado);

-- 6. Tabla de Donaciones
CREATE TABLE IF NOT EXISTS public.donaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    donante TEXT NOT NULL,
    correo TEXT,
    tipo tipo_donacion NOT NULL,
    detalle TEXT NOT NULL,
    monto NUMERIC(12,2) CHECK (monto >= 0),
    estado estado_donacion NOT NULL DEFAULT 'Pendiente',
    preferencia_pago_id TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabla de Campañas de Recaudación
CREATE TABLE IF NOT EXISTS public.campanas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    meta NUMERIC(12,2) NOT NULL CHECK (meta >= 0),
    recaudado NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (recaudado >= 0),
    cierre_fecha TEXT NOT NULL,
    imagen_url TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabla de Productos (Tienda Solidaria)
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    descripcion TEXT NOT NULL,
    imagen_url TEXT NOT NULL,
    destacado BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Tabla de Pedidos de la Tienda
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cliente TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    ciudad TEXT NOT NULL DEFAULT 'Bogotá',
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    articulos_cantidad INTEGER NOT NULL DEFAULT 1,
    estado estado_pedido NOT NULL DEFAULT 'Pendiente',
    preferencia_pago_id TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pedido_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

-- 10. Tabla de Eventos
CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    lugar TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    cupos INTEGER NOT NULL CHECK (cupos >= 0),
    inscritos INTEGER NOT NULL DEFAULT 0 CHECK (inscritos >= 0),
    descripcion TEXT NOT NULL,
    imagen_url TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inscripciones_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(evento_id, correo)
);

-- 11. Tabla de Denuncias por Maltrato / Abandono
CREATE TABLE IF NOT EXISTS public.denuncias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_hecho TEXT NOT NULL,
    prioridad prioridad_denuncia NOT NULL DEFAULT 'Media',
    anonimo BOOLEAN NOT NULL DEFAULT true,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    denunciante TEXT,
    contacto TEXT,
    evidencias TEXT[] NOT NULL DEFAULT '{}',
    responsable TEXT,
    animales TEXT NOT NULL,
    estado estado_denuncia NOT NULL DEFAULT 'Recibida',
    seguimiento JSONB NOT NULL DEFAULT '[]'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Mensajería y Notificaciones
CREATE TABLE IF NOT EXISTS public.conversaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ultimo_mensaje TEXT,
    no_leidos INTEGER NOT NULL DEFAULT 0,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
    remitente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    autor_tipo TEXT NOT NULL CHECK (autor_tipo IN ('yo', 'ellos', 'sistema')),
    texto TEXT NOT NULL,
    adjunto_url TEXT,
    leido BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    detalle TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('solicitud', 'mensaje', 'donacion', 'evento', 'sistema')),
    leida BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Funciones y Triggers para timestamps automáticos
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trg_perfiles_actualizado BEFORE UPDATE ON public.perfiles FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_mascotas_actualizado BEFORE UPDATE ON public.mascotas FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_solicitudes_actualizado BEFORE UPDATE ON public.solicitudes_adopcion FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_pedidos_actualizado BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_denuncias_actualizado BEFORE UPDATE ON public.denuncias FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 14. Trigger para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre, correo, rol, ciudad, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'rol')::rol_usuario, 'adoptante'),
        COALESCE(NEW.raw_user_meta_data->>'ciudad', 'Bogotá'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        nombre = EXCLUDED.nombre,
        avatar_url = EXCLUDED.avatar_url;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN undefined_table THEN null; END $$;
