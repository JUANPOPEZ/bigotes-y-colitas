-- ====================================================================
-- SEED DATA: DATOS INICIALES PARA PRUEBAS (SUPABASE / POSTGRESQL)
-- ====================================================================

-- 1. Insertar las 28 mascotas (corregidas taxonómicamente)
INSERT INTO public.mascotas (
    nombre, especie, raza, sexo, edad, edad_meses, peso, tamano, ciudad, estado,
    esterilizado, vacunado, compatible_ninos, compatible_mascotas, necesidades_especiales,
    energia, personalidad, historia, salud, destacada, ingreso_fecha
) VALUES
('Canela', 'Perro', 'Criollo', 'Hembra', '2 años', 24, 14.0, 'Mediano', 'Bogotá', 'Disponible', true, true, true, true, false, 'Media', ARRAY['Cariñosa', 'Tranquila', 'Sociable'], 'Canela llegó a Bigotes y Colitas después de ser rescatada de la calle. Hoy es una compañera tranquila que disfruta los paseos cortos.', 'Excelente estado general, desparasitada.', true, '10/02/2026'),
('Nube', 'Gato', 'Mestizo', 'Hembra', '1 año', 12, 4.0, 'Pequeño', 'Medellín', 'Disponible', true, true, true, false, false, 'Baja', ARRAY['Curiosa', 'Independiente'], 'Nube fue entregada por una familia que no podía cuidarla. Le encanta observar por la ventana.', 'Sana, con control veterinario mensual.', true, '22/03/2026'),
('Tomás', 'Perro', 'Beagle mix', 'Macho', '4 meses', 4, 6.0, 'Pequeño', 'Bogotá', 'En proceso', false, true, true, true, false, 'Alta', ARRAY['Juguetón', 'Enérgico', 'Leal'], 'Tomás es un cachorro lleno de energía que necesita una familia activa con espacio.', 'Cachorro sano en esquema de vacunación.', true, '01/06/2026'),
('Luna', 'Gato', 'Siamés mix', 'Hembra', '6 años', 72, 5.0, 'Pequeño', 'Cali', 'Disponible', true, true, false, true, true, 'Baja', ARRAY['Calmada', 'Discreta'], 'Luna necesita una casa tranquila; requiere dieta especial por su condición renal.', 'Condición renal controlada con dieta veterinaria.', false, '14/11/2025'),
('Rocco', 'Perro', 'Labrador mix', 'Macho', '5 años', 60, 26.0, 'Grande', 'Medellín', 'Disponible', true, true, true, true, false, 'Media', ARRAY['Noble', 'Obediente', 'Protector'], 'Rocco convivió con niños toda su vida y busca una segunda oportunidad.', 'Sano, con displasia leve controlada.', false, '30/12/2025'),
('Mia', 'Gato', 'Mestiza', 'Hembra', '3 meses', 3, 1.4, 'Pequeño', 'Bogotá', 'Adoptado', false, false, true, true, false, 'Alta', ARRAY['Traviesa', 'Cariñosa'], 'Mia encontró hogar en junio con una familia de Chapinero.', 'En esquema inicial de vacunación.', false, '02/05/2026'),
('Bruno', 'Perro', 'Pastor mix', 'Macho', '3 años', 36, 22.0, 'Grande', 'Cali', 'En tratamiento', true, true, true, false, true, 'Media', ARRAY['Valiente', 'Reservado'], 'Bruno se recupera de una fractura y estará disponible pronto.', 'En rehabilitación por fractura en pata trasera.', false, '08/06/2026'),
('Pelusa', 'Gato', 'Persa mix', 'Macho', '2 años', 24, 6.0, 'Mediano', 'Bogotá', 'Disponible', true, true, true, true, false, 'Baja', ARRAY['Dormilón', 'Sociable'], 'Pelusa disfruta la compañía humana y los espacios cálidos.', 'Sano, requiere cepillado frecuente.', true, '17/01/2026'),
('Simba', 'Perro', 'Golden mix', 'Macho', '3 años', 36, 28.0, 'Grande', 'Bogotá', 'Disponible', true, true, true, true, false, 'Media', ARRAY['Noble', 'Cariñoso', 'Paciente'], 'Simba fue entregado por una familia que se mudó al exterior.', 'Sano, con control anual al día.', true, '05/03/2026'),
('Frida', 'Gato', 'Mestiza', 'Hembra', '2 años', 24, 4.2, 'Pequeño', 'Medellín', 'Disponible', true, true, true, true, false, 'Media', ARRAY['Elegante', 'Sociable'], 'Frida fue rescatada de una obra en construcción.', 'Sana, desparasitada.', true, '18/03/2026'),
('Milo', 'Perro', 'Criollo pequeño', 'Macho', '1 año', 12, 5.5, 'Pequeño', 'Cali', 'Disponible', true, true, true, true, false, 'Alta', ARRAY['Alegre', 'Curioso'], 'Milo es muy alegre y juguetón.', 'Buen estado general.', false, '11/04/2026'),
('Sol', 'Gato', 'Naranja mestizo', 'Macho', '4 años', 48, 5.8, 'Mediano', 'Bogotá', 'Disponible', true, true, true, true, false, 'Baja', ARRAY['Dormilón', 'Tranquilo'], 'Sol pasó dos años en la calle y ahora disfruta las siestas al sol.', 'Sano, dieta de control de peso.', true, '27/01/2026'),
('Duna', 'Perro', 'Labrador mix', 'Hembra', '6 años', 72, 24.0, 'Grande', 'Medellín', 'Disponible', true, true, true, true, false, 'Media', ARRAY['Serena', 'Leal'], 'Duna busca un hogar donde envejecer con calma.', 'Artrosis leve controlada.', false, '12/12/2025'),
('Nina', 'Gato', 'Siamés mix', 'Hembra', '8 meses', 8, 3.1, 'Pequeño', 'Cali', 'Disponible', true, true, true, true, false, 'Alta', ARRAY['Conversadora', 'Activa'], 'Nina es la más habladora de la camada.', 'Esquema de vacunación completo.', true, '03/05/2026'),
('Toby', 'Perro', 'Beagle mix', 'Macho', '2 años', 24, 11.0, 'Mediano', 'Bogotá', 'En proceso', true, true, true, true, false, 'Alta', ARRAY['Rastreador', 'Amigable'], 'Toby tiene un gran olfato y necesita actividad.', 'Sano.', false, '22/02/2026'),
('Maya', 'Gato', 'Persa mix', 'Hembra', '3 años', 36, 4.6, 'Pequeño', 'Medellín', 'Disponible', true, true, false, true, false, 'Baja', ARRAY['Reservada', 'Cariñosa'], 'Maya prefiere espacios silenciosos.', 'Requiere cepillado diario.', false, '08/02/2026'),
('Rocky', 'Perro', 'Pastor mix', 'Macho', '5 años', 60, 30.0, 'Grande', 'Cali', 'Disponible', true, true, true, false, false, 'Media', ARRAY['Protector', 'Obediente'], 'Rocky busca una familia con patio.', 'Sano, displasia leve.', true, '19/11/2025'),
('Copo', 'Gato', 'Mestizo', 'Macho', '5 meses', 5, 1.8, 'Pequeño', 'Bogotá', 'Disponible', false, true, true, true, false, 'Alta', ARRAY['Travieso', 'Explorador'], 'Copo fue rescatado a tiempo de un motor.', 'En esquema inicial.', true, '14/06/2026'),
('Kira', 'Perro', 'Criolla', 'Hembra', '4 años', 48, 18.0, 'Mediano', 'Medellín', 'En tratamiento', true, true, true, true, true, 'Baja', ARRAY['Dulce', 'Tímida'], 'Kira se recupera de desnutrición.', 'En recuperación nutricional.', false, '20/05/2026'),
('Lolo', 'Gato', 'Atigrado', 'Macho', '1 año', 12, 4.0, 'Pequeño', 'Cali', 'Disponible', true, true, true, true, false, 'Media', ARRAY['Juguetón', 'Sociable'], 'Lolo convive excelente con otros animales.', 'Sano.', false, '09/04/2026'),
('Sasha', 'Perro', 'Husky mix', 'Hembra', '3 años', 36, 21.0, 'Grande', 'Bogotá', 'Disponible', true, true, true, true, false, 'Alta', ARRAY['Enérgica', 'Independiente'], 'Sasha necesita una familia deportista.', 'Sana.', true, '01/03/2026'),
('Pepa', 'Gato', 'Calico', 'Hembra', '6 meses', 6, 2.4, 'Pequeño', 'Medellín', 'Disponible', false, true, true, true, false, 'Alta', ARRAY['Curiosa', 'Cariñosa'], 'Pepa llegó con sus hermanas rescatadas.', 'Pendiente esterilización.', true, '02/06/2026'),
('Bongo', 'Perro', 'Chihuahua mix', 'Macho', '7 años', 84, 3.8, 'Pequeño', 'Cali', 'Disponible', true, true, false, true, true, 'Baja', ARRAY['Territorial', 'Fiel'], 'Bongo busca un hogar tranquilo de adulto mayor.', 'Problemas dentales tratados.', false, '29/12/2025'),
('Aura', 'Gato', 'Gris de pelo largo', 'Hembra', '4 años', 48, 5.0, 'Mediano', 'Bogotá', 'En proceso', true, true, true, true, false, 'Baja', ARRAY['Observadora', 'Calmada'], 'Aura vivió en una colonia urbana.', 'Sana.', false, '15/01/2026'),
('Chocolo', 'Perro', 'Criollo', 'Macho', '8 meses', 8, 9.0, 'Mediano', 'Medellín', 'Disponible', false, true, true, true, false, 'Alta', ARRAY['Juguetón', 'Leal'], 'Chocolo creció en el refugio.', 'Sano.', true, '20/02/2026'),
('Estrella', 'Gato', 'Siamés', 'Hembra', '2 años', 24, 3.9, 'Pequeño', 'Cali', 'Disponible', true, true, true, false, false, 'Media', ARRAY['Exigente', 'Fiel'], 'Estrella prefiere ser gata única.', 'Sana.', false, '25/03/2026'),
('Otto', 'Perro', 'Rottweiler mix', 'Macho', '4 años', 48, 34.0, 'Grande', 'Bogotá', 'En tratamiento', true, true, true, true, true, 'Media', ARRAY['Noble', 'Fuerte'], 'Otto rescatado de maltrato, en recuperación.', 'Rehabilitación de cadera.', false, '28/04/2026'),
('Trufa', 'Gato', 'Mestiza', 'Hembra', '3 años', 36, 4.4, 'Pequeño', 'Medellín', 'Adoptado', true, true, true, true, false, 'Media', ARRAY['Mimosa', 'Tranquila'], 'Trufa adoptada en julio con una pareja.', 'Sana.', false, '10/01/2026')
ON CONFLICT DO NOTHING;

-- 2. Insertar Campañas
INSERT INTO public.campanas (titulo, descripcion, meta, recaudado, cierre_fecha) VALUES
('Invierno cálido', 'Cobijas y camas para las mascotas durante la temporada de lluvias.', 4000000, 2650000, '30/08/2026'),
('Esterilización responsable', 'Jornada de esterilización para 60 perros y gatos rescatados.', 6000000, 1980000, '15/09/2026'),
('Alimento del mes', 'Concentrado para los 84 animales bajo nuestro cuidado.', 3000000, 2870000, '31/07/2026')
ON CONFLICT DO NOTHING;

-- 3. Insertar Productos
INSERT INTO public.productos (nombre, categoria, precio, stock, descripcion, imagen_url, destacado) VALUES
('Collar artesanal', 'Accesorios', 38000, 24, 'Collar en cuero natural con hebilla dorada.', 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=500', true),
('Cama nido crema', 'Descanso', 129000, 8, 'Cama acolchada lavable para perros medianos.', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500', true),
('Concentrado natural 3 kg', 'Alimento', 74000, 40, 'Alimento balanceado sin colorantes.', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500', true),
('Juguete mordedor', 'Juguetes', 22000, 60, 'Mordedor resistente de caucho natural.', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500', false),
('Rascador de sisal', 'Gatos', 96000, 12, 'Rascador vertical con base estable.', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500', true),
('Camiseta solidaria', 'Merch', 55000, 30, 'Cada compra apoya una esterilización.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', false)
ON CONFLICT DO NOTHING;

-- 4. Insertar Eventos
INSERT INTO public.eventos (titulo, fecha, hora, lugar, ciudad, cupos, inscritos, descripcion) VALUES
('Jornada de adopción en el parque', '09/08/2026', '9:00 a.m.', 'Parque El Virrey', 'Bogotá', 120, 84, 'Ven a conocer a 25 mascotas que buscan hogar. Habrá asesoría veterinaria gratuita.'),
('Taller: primeros cuidados', '17/08/2026', '3:00 p.m.', 'Casa Bigotes', 'Medellín', 40, 31, 'Aprende los cuidados básicos de un cachorro recién adoptado.'),
('Brigada de esterilización', '05/09/2026', '8:00 a.m.', 'Centro comunitario', 'Cali', 60, 60, 'Jornada gratuita de esterilización con cita previa.')
ON CONFLICT DO NOTHING;

-- 5. Insertar Denuncias de Prueba
INSERT INTO public.denuncias (
    folio, tipo, ciudad, ubicacion, descripcion, fecha_hecho, prioridad, anonimo, responsable, animales, estado, seguimiento
) VALUES
('DEN-2026-018', 'Maltrato', 'Bogotá', 'Carrera 24 # 68-41, barrio Siete de Agosto', 'Vecino golpea a un perro mestizo en el patio trasero.', '27/07/2026', 'Alta', true, 'Equipo de campo Bogotá', '1 perro mestizo adulto', 'Verificación en campo', '[{"fecha":"28/07/2026","titulo":"Denuncia recibida","detalle":"Reporte anónimo"},{"fecha":"29/07/2026","titulo":"Visita en campo","detalle":"Equipo desplazado"}]'::jsonb),
('DEN-2026-017', 'Abandono', 'Bogotá', 'Calle 68 con Carrera 24, lote sin construir', 'Perro atado en un lote sin agua ni alimento.', '26/07/2026', 'Media', false, 'Equipo de campo Bogotá', '1 perro mestizo', 'En revisión', '[{"fecha":"27/07/2026","titulo":"Revisión inicial","detalle":"En espera de asignación de patrulla"}]'::jsonb)
ON CONFLICT (folio) DO NOTHING;
