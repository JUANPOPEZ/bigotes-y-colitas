# Formato de Prácticas de Laboratorio — Universidad Manuela Beltrán (UMB)
**Nombre del Proceso:** GESTIÓN DE LABORATORIOS  
**Código:** LA-FM-001 | **Versión:** 7 | **Fecha:** 15/junio/2022  
**Nombre del Documento:** FORMATO PRÁCTICAS DE LABORATORIOS  
**Proyecto:** Bigotes y Colitas (Refugio y Gestión Animal)  
**Guía:** Guía No. 4 — Patrones de Software y Prototipo Funcional  

---

## 1. Definición de Historias de Usuario del Aplicativo (Product Backlog)

### Plantilla de Historias de Usuario

| No. Historia de usuario | Como `<tipo de usuario>` | Quiero `<realizar alguna tarea>` | Para que pueda `<lograr algún objetivo>` | Criterios de Aceptación / Verificación en Prototipo |
| :--- | :--- | :--- | :--- | :--- |
| **HU-01** | **Administrador del refugio** | Validar que todos los campos obligatorios (* Nombre, Especie, Raza, Sexo, Edad, Peso, Tamaño, Ciudad, Estado, Fecha e Historia) estén diligenciados antes de registrar o editar una mascota | Evitar el ingreso de fichas incompletas o datos corruptos en el sistema del refugio | Al intentar guardar con campos vacíos, el sistema bloquea el registro y muestra un mensaje de alerta indicando los campos faltantes. |
| **HU-02** | **Adoptante / Visitante** | Visualizar en el catálogo de adopción únicamente a las mascotas que se encuentren disponibles, en proceso o en tratamiento | No generar falsas expectativas al intentar adoptar animales que ya cuentan con un hogar definitivo | Las mascotas con estado `"Adoptado"` son filtradas y excluidas automáticamente de la vista pública de adopción. |
| **HU-03** | **Adoptante / Visitante** | Ver fotografías que coincidan con la especie (perro o gato) y características de la ficha de la mascota | Conocer el aspecto real y fidedigno del animal antes de postular una solicitud de adopción | Cada ficha de perro contiene exclusivamente fotos de perros y cada ficha de gato contiene fotos de gatos. |
| **HU-04** | **Administrador del refugio** | Disponer de una base de datos relacional (PostgreSQL en Supabase) con tablas estructuradas, llaves foráneas y reglas RLS | Centralizar y proteger la información de mascotas, solicitudes, donaciones, inventario y usuarios | Esquema SQL ejecutado con éxito, tablas creadas con políticas de seguridad por rol (RLS). |
| **HU-05** | **Adoptante interesado** | Diligenciar y enviar una solicitud de adopción en un formulario guiado de 4 pasos (Mascota, Datos, Hogar, Compromiso) | Postularme como candidato idóneo para brindarle un hogar responsable a una mascota | Envío exitoso con generación de código de radicado único (`SOL-2026-XXX`) y control de límite de solicitudes activas. |
| **HU-06** | **Ciudadano / Denunciante** | Radicar denuncias por maltrato o abandono de forma anónima o identificada con adjuntos de evidencia | Alertar oportunamente al equipo de rescate sobre situaciones de riesgo animal | Registro de denuncia con generación de folio único (`DEN-2026-XXX`) y almacenamiento seguro de evidencias. |
| **HU-07** | **Donante / Padrino** | Realizar donaciones económicas o en especie y conocer las campañas activas del refugio | Contribuir activamente a la manutención, salud y esterilización de los animales rescatados | Registro de donaciones y visualización del progreso de recaudación de campañas solidarias. |
| **HU-08** | **Comprador solidario** | Explorar el catálogo de la tienda solidaria, agregar artículos al carrito y realizar pedidos | Adquirir productos para mis mascotas sabiendo que las ganancias apoyan directamente al refugio | Catálogo interactivo con stock, filtros por categoría y registro de pedidos. |
| **HU-09** | **Voluntario / Comunidad** | Consultar e inscribirme a eventos del refugio (jornadas de adopción, talleres de cuidado y brigadas) | Participar activamente en actividades de bienestar animal en mi ciudad | Listado de eventos con control de aforo (cupos disponibles e inscritos). |

---

## 2. Estimaciones por Tareas (Sprint 1 — Backend & Prototipo)

| Tarea | Responsable | Estimación (Horas) | Estado |
| :--- | :--- | :---: | :---: |
| **T-01:** Validación de campos obligatorios en formulario de mascotas | Backend / Frontend | 3 h | ✅ Completado |
| **T-02:** Exclusión de mascotas adoptadas en catálogo de adopción | Backend / Frontend | 2 h | ✅ Completado |
| **T-03:** Corrección y clasificación de las 28 imágenes por especie | Backend / Frontend | 3 h | ✅ Completado |
| **T-04:** Diseño de modelo de datos relacional y migraciones SQL | Backend | 6 h | ✅ Completado |
| **T-05:** Configuración de políticas de seguridad RLS en Supabase | Backend | 4 h | ✅ Completado |
| **T-06:** Configuración de buckets de Storage (avatars, pets, products, evidence) | Backend | 2 h | ✅ Completado |
| **T-07:** Script de Seed Data con datos reales normalizados | Backend | 3 h | ✅ Completado |
| **T-08:** Cliente Supabase y tipado TypeScript en frontend | Backend / Frontend | 2 h | ✅ Completado |
