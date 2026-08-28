-- ====================================================================
-- MIGRACIÓN 3: STORAGE BUCKETS Y POLÍTICAS DE ALMACENAMIENTO (SUPABASE)
-- ====================================================================

-- 1. Crear buckets de almacenamiento en el esquema storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('pets', 'pets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('reports_evidence', 'reports_evidence', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Políticas de Storage para 'pets' (Lectura pública, subida solo administradores)
CREATE POLICY "Lectura publica de fotos de mascotas"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'pets');

CREATE POLICY "Admins suben fotos de mascotas"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'pets' AND (public.es_admin() OR auth.role() = 'service_role'));

CREATE POLICY "Admins eliminan fotos de mascotas"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'pets' AND (public.es_admin() OR auth.role() = 'service_role'));

-- 3. Políticas de Storage para 'avatars' (Lectura pública, usuarios suben su avatar)
CREATE POLICY "Lectura publica de avatares"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Usuarios autenticados suben avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Usuarios actualizan su propio avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Políticas de Storage para 'products' (Lectura pública, admins suben)
CREATE POLICY "Lectura publica de imagenes de productos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

CREATE POLICY "Admins suben imagenes de productos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'products' AND (public.es_admin() OR auth.role() = 'service_role'));

-- 5. Políticas de Storage para 'reports_evidence' (Subida pública/autenticada, lectura restringida a admins)
CREATE POLICY "Cualquiera puede subir evidencias de denuncia"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'reports_evidence');

CREATE POLICY "Solo administradores leen evidencias de denuncias"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'reports_evidence' AND (public.es_admin() OR auth.role() = 'service_role'));
