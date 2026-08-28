-- ====================================================================
-- MIGRACIÓN 2: POLÍTICAS DE ROW LEVEL SECURITY (RLS) (SUPABASE)
-- ====================================================================

-- Función auxiliar para verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol = 'administrador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_adopcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- POLÍTICAS: Perfiles
-- --------------------------------------------------------------------
CREATE POLICY "Lectura publica de perfiles basicos"
    ON public.perfiles FOR SELECT
    USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.perfiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins pueden gestionar todos los perfiles"
    ON public.perfiles FOR ALL
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Mascotas
-- --------------------------------------------------------------------
CREATE POLICY "Cualquiera puede ver mascotas"
    ON public.mascotas FOR SELECT
    USING (true);

CREATE POLICY "Solo administradores pueden crear mascotas"
    ON public.mascotas FOR INSERT
    WITH CHECK (public.es_admin());

CREATE POLICY "Solo administradores pueden editar mascotas"
    ON public.mascotas FOR UPDATE
    USING (public.es_admin());

CREATE POLICY "Solo administradores pueden eliminar mascotas"
    ON public.mascotas FOR DELETE
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Solicitudes de Adopción
-- --------------------------------------------------------------------
CREATE POLICY "Cualquiera puede enviar una solicitud de adopcion"
    ON public.solicitudes_adopcion FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados ven sus propias solicitudes"
    ON public.solicitudes_adopcion FOR SELECT
    USING (auth.uid() = usuario_id OR public.es_admin());

CREATE POLICY "Admins pueden actualizar solicitudes de adopcion"
    ON public.solicitudes_adopcion FOR UPDATE
    USING (public.es_admin());

CREATE POLICY "Admins pueden eliminar solicitudes de adopcion"
    ON public.solicitudes_adopcion FOR DELETE
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Donaciones
-- --------------------------------------------------------------------
CREATE POLICY "Cualquiera puede registrar una donacion"
    ON public.donaciones FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios ven sus donaciones y admins ven todas"
    ON public.donaciones FOR SELECT
    USING (auth.uid() = usuario_id OR public.es_admin());

CREATE POLICY "Solo admins modifican estado de donaciones"
    ON public.donaciones FOR UPDATE
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Campañas
-- --------------------------------------------------------------------
CREATE POLICY "Lectura publica de campanas"
    ON public.campanas FOR SELECT
    USING (true);

CREATE POLICY "Admins gestionan campanas"
    ON public.campanas FOR ALL
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Productos
-- --------------------------------------------------------------------
CREATE POLICY "Lectura publica de productos"
    ON public.productos FOR SELECT
    USING (true);

CREATE POLICY "Admins gestionan catalogo de productos"
    ON public.productos FOR ALL
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Pedidos y Pedido Items
-- --------------------------------------------------------------------
CREATE POLICY "Cualquiera puede crear un pedido"
    ON public.pedidos FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios ven sus propios pedidos y admins ven todos"
    ON public.pedidos FOR SELECT
    USING (auth.uid() = usuario_id OR public.es_admin());

CREATE POLICY "Admins gestionan pedidos"
    ON public.pedidos FOR UPDATE
    USING (public.es_admin());

CREATE POLICY "Cualquiera puede insertar items en su pedido"
    ON public.pedido_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Lectura de items de pedidos"
    ON public.pedido_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_id AND (p.usuario_id = auth.uid() OR public.es_admin())
        )
    );

-- --------------------------------------------------------------------
-- POLÍTICAS: Eventos e Inscripciones
-- --------------------------------------------------------------------
CREATE POLICY "Lectura publica de eventos"
    ON public.eventos FOR SELECT
    USING (true);

CREATE POLICY "Admins gestionan eventos"
    ON public.eventos FOR ALL
    USING (public.es_admin());

CREATE POLICY "Cualquiera puede inscribirse a un evento"
    ON public.inscripciones_eventos FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios ven sus inscripciones y admins ven todas"
    ON public.inscripciones_eventos FOR SELECT
    USING (auth.uid() = usuario_id OR public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Denuncias
-- --------------------------------------------------------------------
CREATE POLICY "Cualquiera puede enviar una denuncia anonima o publica"
    ON public.denuncias FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins y denunciantes autenticados ven denuncias"
    ON public.denuncias FOR SELECT
    USING (auth.uid() = usuario_id OR public.es_admin());

CREATE POLICY "Solo admins actualizan seguimiento de denuncias"
    ON public.denuncias FOR UPDATE
    USING (public.es_admin());

-- --------------------------------------------------------------------
-- POLÍTICAS: Conversaciones y Mensajes
-- --------------------------------------------------------------------
CREATE POLICY "Usuarios ven sus propias conversaciones"
    ON public.conversaciones FOR SELECT
    USING (auth.uid() = usuario_id OR public.es_admin());

CREATE POLICY "Usuarios crean sus conversaciones"
    ON public.conversaciones FOR INSERT
    WITH CHECK (auth.uid() = usuario_id OR public.es_admin());

CREATE POLICY "Participantes ven los mensajes"
    ON public.mensajes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversaciones c
            WHERE c.id = conversacion_id AND (c.usuario_id = auth.uid() OR public.es_admin())
        )
    );

CREATE POLICY "Participantes envian mensajes"
    ON public.mensajes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversaciones c
            WHERE c.id = conversacion_id AND (c.usuario_id = auth.uid() OR public.es_admin())
        )
    );

-- --------------------------------------------------------------------
-- POLÍTICAS: Notificaciones
-- --------------------------------------------------------------------
CREATE POLICY "Usuarios acceden unicamente a sus notificaciones"
    ON public.notificaciones FOR ALL
    USING (auth.uid() = usuario_id);
