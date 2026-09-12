# Reemplazar el Blog por el módulo de Denuncias

## Objetivo

Quitar el apartado de Blog del sitio y reemplazarlo por Denuncias como módulo principal: recepción de reportes ciudadanos (similar a solicitudes de adopción) y su seguimiento desde el panel de administrador, **sin CRUD** (no se crean ni eliminan denuncias desde el admin: solo se consultan y se gestiona su estado/seguimiento).

## Pasos

1. **Retirar el Blog del sitio**
  - Eliminar las rutas `/_site/blog` (listado y detalle) y el módulo admin de "Contenido" (que administra el blog).
  - Quitar los enlaces "Blog" del navbar y del footer, y cualquier sección de blog en la landing y en el dashboard admin.
  - Reemplazar esos enlaces por "Denuncias".
2. **Datos y modelo de denuncia**
  - Ampliar el mock de denuncias para que se parezca a una solicitud: folio, tipo de caso, ciudad, dirección, fecha del hecho, descripción, evidencia adjunta, datos del denunciante (o anónimo), prioridad, estado y cronología de seguimiento.
  - Estados del flujo: Recibida → En revisión → Verificación en campo → Atendida → Cerrada (y Descartada).
3. **Página pública de denuncias** (`/denuncias`)
  - Formulario de reporte con validación (campos obligatorios, límites de longitud, opción anónima, carga de evidencia).
  - Al enviar, confirmación con número de folio generado y aviso de emergencia visible.
  - Consulta de estado por folio con la línea de tiempo del caso.
4. **Apartado de Denuncias en el panel de administrador** (`/admin/denuncias`)
  - Bandeja de entrada tipo solicitudes: tabla con búsqueda, filtros (estado, tipo, ciudad, prioridad), orden, paginación y exportar.
  - KPIs arriba: denuncias recibidas, en revisión, atendidas y cerradas.
  - Vista de detalle en panel lateral: datos del caso, evidencia, denunciante (o "Anónimo"), descripción y cronología.
  - **Sin crear ni eliminar.** Las únicas acciones son: cambiar estado, asignar responsable/prioridad y agregar una nota de seguimiento a la cronología.
5. **Integración con el resto del admin**
  - Ajustar la navegación lateral (quitar "Contenido", dejar "Denuncias").
  - Añadir denuncias al dashboard: tarjeta de KPI y lista de últimos casos recibidos.
6. Incluir denuncias en el módulo de Reportes (conteo por estado y por tipo) (Ya esta, según lo que vi).
7. **Metadatos y verificación**
  - `head()` propio en las páginas de denuncias (título, descripción, og/twitter).
  - Revisar que no queden enlaces rotos al blog y validar tipos/compilación.

## Notas técnicas

- Todo sigue con datos mock en `src/mock/`, sin backend.
- La bandeja del admin reutiliza el `DataTable` (búsqueda/filtros/orden/exportar) pero **no** el `CrudModule`, para evitar acciones de alta y borrado.
- Se conserva la paleta cálida y la tipografía existentes.