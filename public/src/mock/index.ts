import type {
  Campana,
  Conversacion,
  Denuncia,
  Donacion,
  Evento,
  Notificacion,
  Pedido,
  Producto,
  Solicitud,
  Usuario,
} from "@/types";
import pet1 from "@/assets/pet-1.jpg";
import pet2 from "@/assets/pet-2.jpg";
import pet3 from "@/assets/pet-3.jpg";
import pet4 from "@/assets/pet-4.jpg";
import pet10 from "@/assets/pet-10.jpg";
import prodCollar from "@/assets/prod-collar.jpg";
import prodCama from "@/assets/prod-cama.jpg";
import prodAlimento from "@/assets/prod-alimento.jpg";
import prodJuguete from "@/assets/prod-juguete.jpg";
import prodRascador from "@/assets/prod-rascador.jpg";
import prodCamiseta from "@/assets/prod-camiseta.jpg";

/** Datos simulados. Sustituir por las respuestas de la API REST. */

export const usuarios: Usuario[] = [
  {
    id: "u1",
    nombre: "María Fernanda López",
    correo: "maria.lopez@correo.com",
    rol: "adoptante",
    ciudad: "Bogotá",
    estado: "Activo",
    registro: "12/01/2026",
  },
  {
    id: "u2",
    nombre: "Carlos Ramírez",
    correo: "carlos.ramirez@correo.com",
    rol: "adoptante",
    ciudad: "Medellín",
    estado: "Activo",
    registro: "03/02/2026",
  },
  {
    id: "u3",
    nombre: "Equipo Bigotes y Colitas",
    correo: "admin@bigotesycolitas.org",
    rol: "administrador",
    ciudad: "Bogotá",
    estado: "Activo",
    registro: "01/01/2025",
  },
  {
    id: "u4",
    nombre: "Laura Gómez",
    correo: "laura.gomez@correo.com",
    rol: "adoptante",
    ciudad: "Cali",
    estado: "Inactivo",
    registro: "22/04/2026",
  },
  {
    id: "u5",
    nombre: "Andrés Peña",
    correo: "andres.pena@correo.com",
    rol: "adoptante",
    ciudad: "Bogotá",
    estado: "Activo",
    registro: "18/05/2026",
  },
];

export const solicitudes: Solicitud[] = [
  {
    id: "s1",
    mascota: "Canela",
    mascotaId: "1",
    solicitante: "María Fernanda López",
    correo: "maria.lopez@correo.com",
    ciudad: "Bogotá",
    fecha: "12/07/2026",
    estado: "Entrevista",
    cronologia: [
      { fecha: "12/07/2026", titulo: "Solicitud enviada", detalle: "Formulario completo recibido." },
      { fecha: "14/07/2026", titulo: "En revisión", detalle: "Documentación verificada." },
      { fecha: "18/07/2026", titulo: "Entrevista agendada", detalle: "Videollamada 22/07 10:00 a.m." },
    ],
  },
  {
    id: "s2",
    mascota: "Tomás",
    mascotaId: "3",
    solicitante: "Carlos Ramírez",
    correo: "carlos.ramirez@correo.com",
    ciudad: "Medellín",
    fecha: "05/07/2026",
    estado: "Visita",
    cronologia: [
      { fecha: "05/07/2026", titulo: "Solicitud enviada", detalle: "Formulario completo recibido." },
      { fecha: "09/07/2026", titulo: "Entrevista realizada", detalle: "Resultado favorable." },
      { fecha: "20/07/2026", titulo: "Visita domiciliaria", detalle: "Programada para el 26/07." },
    ],
  },
  {
    id: "s3",
    mascota: "Pelusa",
    mascotaId: "8",
    solicitante: "Andrés Peña",
    correo: "andres.pena@correo.com",
    ciudad: "Bogotá",
    fecha: "21/07/2026",
    estado: "Pendiente",
    cronologia: [
      { fecha: "21/07/2026", titulo: "Solicitud enviada", detalle: "En espera de revisión." },
    ],
  },
  {
    id: "s4",
    mascota: "Luna",
    mascotaId: "4",
    solicitante: "Laura Gómez",
    correo: "laura.gomez@correo.com",
    ciudad: "Cali",
    fecha: "28/06/2026",
    estado: "Rechazada",
    cronologia: [
      { fecha: "28/06/2026", titulo: "Solicitud enviada", detalle: "Formulario recibido." },
      { fecha: "02/07/2026", titulo: "Rechazada", detalle: "No cumple requisitos de espacio." },
    ],
  },
  {
    id: "s5",
    mascota: "Mia",
    mascotaId: "6",
    solicitante: "María Fernanda López",
    correo: "maria.lopez@correo.com",
    ciudad: "Bogotá",
    fecha: "02/06/2026",
    estado: "Aprobada",
    cronologia: [
      { fecha: "02/06/2026", titulo: "Solicitud enviada", detalle: "Formulario recibido." },
      { fecha: "12/06/2026", titulo: "Aprobada", detalle: "Entrega realizada el 15/06." },
    ],
  },
  {
    id: "s6",
    mascota: "Simba",
    mascotaId: "3",
    solicitante: "Carlos Ramírez",
    correo: "carlos.ramirez@correo.com",
    ciudad: "Medellín",
    fecha: "10/05/2026",
    estado: "Entregado",
    cronologia: [
      { fecha: "10/05/2026", titulo: "Solicitud enviada", detalle: "Formulario recibido." },
      { fecha: "18/05/2026", titulo: "Aprobada", detalle: "Visita domiciliaria satisfactoria." },
      { fecha: "24/05/2026", titulo: "Entregado", detalle: "Entrega formalizada con acta firmada." },
    ],
  },
];

export const donaciones: Donacion[] = [
  { id: "d1", donante: "María Fernanda López", tipo: "Dinero", detalle: "Aporte mensual", monto: 80000, fecha: "01/07/2026", estado: "Recibida" },
  { id: "d2", donante: "Anónimo", tipo: "Alimentos", detalle: "20 kg concentrado adulto", fecha: "04/07/2026", estado: "Recibida" },
  { id: "d3", donante: "Carlos Ramírez", tipo: "Medicamentos", detalle: "Antiparasitarios", fecha: "10/07/2026", estado: "En tránsito" },
  { id: "d4", donante: "Fundación Patitas", tipo: "Cobijas", detalle: "15 cobijas medianas", fecha: "15/07/2026", estado: "Pendiente" },
  { id: "d5", donante: "Andrés Peña", tipo: "Juguetes", detalle: "Caja de juguetes", fecha: "19/07/2026", estado: "Recibida" },
];

export const campanas: Campana[] = [
  {
    id: "c1",
    titulo: "Invierno cálido",
    descripcion: "Cobijas y camas para las mascotas durante la temporada de lluvias.",
    meta: 4000000,
    recaudado: 2650000,
    cierre: "30/08/2026",
  },
  {
    id: "c2",
    titulo: "Esterilización responsable",
    descripcion: "Jornada de esterilización para 60 perros y gatos rescatados.",
    meta: 6000000,
    recaudado: 1980000,
    cierre: "15/09/2026",
  },
  {
    id: "c3",
    titulo: "Alimento del mes",
    descripcion: "Concentrado para los 84 animales bajo nuestro cuidado.",
    meta: 3000000,
    recaudado: 2870000,
    cierre: "31/07/2026",
  },
];

export const productos: Producto[] = [
  { id: "p1", nombre: "Collar artesanal", categoria: "Accesorios", precio: 38000, stock: 24, descripcion: "Collar en cuero natural con hebilla dorada.", imagen: prodCollar, destacado: true },
  { id: "p2", nombre: "Cama nido crema", categoria: "Descanso", precio: 129000, stock: 8, descripcion: "Cama acolchada lavable para perros medianos.", imagen: prodCama, destacado: true },
  { id: "p3", nombre: "Concentrado natural 3 kg", categoria: "Alimento", precio: 74000, stock: 40, descripcion: "Alimento balanceado sin colorantes.", imagen: prodAlimento, destacado: true },
  { id: "p4", nombre: "Juguete mordedor", categoria: "Juguetes", precio: 22000, stock: 60, descripcion: "Mordedor resistente de caucho natural.", imagen: prodJuguete, destacado: false },
  { id: "p5", nombre: "Rascador de sisal", categoria: "Gatos", precio: 96000, stock: 12, descripcion: "Rascador vertical con base estable.", imagen: prodRascador, destacado: true },
  { id: "p6", nombre: "Camiseta solidaria", categoria: "Merch", precio: 55000, stock: 30, descripcion: "Cada compra apoya una esterilización.", imagen: prodCamiseta, destacado: false },
];

export const pedidos: Pedido[] = [
  { id: "o1", cliente: "María Fernanda López", fecha: "18/07/2026", total: 167000, articulos: 3, estado: "Enviado" },
  { id: "o2", cliente: "Carlos Ramírez", fecha: "15/07/2026", total: 74000, articulos: 1, estado: "Entregado" },
  { id: "o3", cliente: "Andrés Peña", fecha: "21/07/2026", total: 151000, articulos: 2, estado: "Preparando" },
  { id: "o4", cliente: "Laura Gómez", fecha: "09/07/2026", total: 22000, articulos: 1, estado: "Cancelado" },
];

export const eventos: Evento[] = [
  { id: "e1", titulo: "Jornada de adopción en el parque", fecha: "09/08/2026", hora: "9:00 a.m.", lugar: "Parque El Virrey", ciudad: "Bogotá", cupos: 120, inscritos: 84, descripcion: "Ven a conocer a 25 mascotas que buscan hogar. Habrá asesoría veterinaria gratuita.", imagen: pet1 },
  { id: "e2", titulo: "Taller: primeros cuidados", fecha: "17/08/2026", hora: "3:00 p.m.", lugar: "Casa Bigotes", ciudad: "Medellín", cupos: 40, inscritos: 31, descripcion: "Aprende los cuidados básicos de un cachorro recién adoptado.", imagen: pet10 },
  { id: "e3", titulo: "Brigada de esterilización", fecha: "05/09/2026", hora: "8:00 a.m.", lugar: "Centro comunitario", ciudad: "Cali", cupos: 60, inscritos: 60, descripcion: "Jornada gratuita de esterilización con cita previa.", imagen: pet4 },
];

export const denuncias: Denuncia[] = [
  {
    id: "n1",
    folio: "DEN-2026-018",
    tipo: "Maltrato",
    ciudad: "Bogotá",
    ubicacion: "Carrera 24 # 68-41, barrio Siete de Agosto",
    descripcion:
      "Vecino golpea a un perro mestizo en el patio trasero. Se escuchan quejidos durante la noche.",
    fecha: "28/07/2026",
    fechaHecho: "27/07/2026",
    prioridad: "Alta",
    anonimo: true,
    evidencias: ["video-patio.mp4", "foto-perro-1.jpg"],
    responsable: "Equipo de campo Bogotá",
    animales: "1 perro mestizo adulto",
    estado: "Verificación en campo",
    seguimiento: [
      { fecha: "28/07/2026", titulo: "Denuncia recibida", detalle: "Reporte anónimo con evidencia audiovisual." },
      { fecha: "28/07/2026", titulo: "Priorización", detalle: "Clasificada como prioridad alta por riesgo vital." },
      { fecha: "29/07/2026", titulo: "Visita en campo", detalle: "Equipo desplazado junto a la policía ambiental." },
    ],
  },
  {
    id: "n2",
    folio: "DEN-2026-017",
    tipo: "Abandono",
    ciudad: "Bogotá",
    ubicacion: "Calle 68 con Carrera 24, lote sin construir",
    descripcion: "Perro atado en un lote sin agua ni alimento desde hace tres días.",
    fecha: "18/07/2026",
    fechaHecho: "16/07/2026",
    prioridad: "Alta",
    anonimo: false,
    denunciante: "Laura Gómez",
    contacto: "laura.gomez@correo.com",
    evidencias: ["foto-lote.jpg"],
    responsable: "Camila Ruiz",
    animales: "1 perro adulto",
    estado: "En revisión",
    seguimiento: [
      { fecha: "18/07/2026", titulo: "Denuncia recibida", detalle: "Registro con fotografía adjunta." },
      { fecha: "19/07/2026", titulo: "Verificación documental", detalle: "Se contacta a la denunciante para ampliar datos." },
    ],
  },
  {
    id: "n3",
    folio: "DEN-2026-016",
    tipo: "Negligencia",
    ciudad: "Medellín",
    ubicacion: "Barrio Belén, parque principal",
    descripcion: "Gato con heridas visibles deambulando sin atención veterinaria.",
    fecha: "10/07/2026",
    fechaHecho: "09/07/2026",
    prioridad: "Media",
    anonimo: false,
    denunciante: "Carlos Ramírez",
    contacto: "310 555 0134",
    evidencias: ["foto-gato.jpg"],
    responsable: "Equipo de campo Medellín",
    animales: "1 gato adulto",
    estado: "Atendida",
    seguimiento: [
      { fecha: "10/07/2026", titulo: "Denuncia recibida", detalle: "Reporte ciudadano con fotografía." },
      { fecha: "11/07/2026", titulo: "Rescate", detalle: "Animal trasladado a la clínica aliada." },
      { fecha: "13/07/2026", titulo: "Atención veterinaria", detalle: "Curaciones y tratamiento antibiótico." },
    ],
  },
  {
    id: "n4",
    folio: "DEN-2026-015",
    tipo: "Criadero ilegal",
    ciudad: "Cali",
    ubicacion: "Vereda La Buitrera, finca sin nomenclatura",
    descripcion: "Criadero con más de veinte perros en condiciones sanitarias deficientes.",
    fecha: "28/06/2026",
    fechaHecho: "26/06/2026",
    prioridad: "Alta",
    anonimo: true,
    evidencias: ["fotos-criadero.zip"],
    responsable: "Jurídica",
    animales: "Aprox. 20 perros",
    estado: "Cerrada",
    seguimiento: [
      { fecha: "28/06/2026", titulo: "Denuncia recibida", detalle: "Caso remitido a la autoridad ambiental." },
      { fecha: "02/07/2026", titulo: "Operativo", detalle: "Incautación de 18 animales con acompañamiento policial." },
      { fecha: "09/07/2026", titulo: "Cierre del caso", detalle: "Animales en custodia del refugio y proceso sancionatorio abierto." },
    ],
  },
  {
    id: "n5",
    folio: "DEN-2026-014",
    tipo: "Abandono",
    ciudad: "Barranquilla",
    ubicacion: "Calle 84 # 51-22",
    descripcion: "Camada de cachorros dejada en una caja frente a un conjunto residencial.",
    fecha: "24/06/2026",
    fechaHecho: "24/06/2026",
    prioridad: "Media",
    anonimo: false,
    denunciante: "Andrés Peña",
    contacto: "andres.pena@correo.com",
    evidencias: ["foto-caja.jpg"],
    animales: "4 cachorros",
    estado: "Recibida",
    seguimiento: [
      { fecha: "24/06/2026", titulo: "Denuncia recibida", detalle: "Pendiente de asignación de equipo." },
    ],
  },
  {
    id: "n6",
    folio: "DEN-2026-013",
    tipo: "Otro",
    ciudad: "Bucaramanga",
    ubicacion: "Avenida Quebrada Seca",
    descripcion: "Reporte de venta informal de animales en la vía pública.",
    fecha: "12/06/2026",
    fechaHecho: "11/06/2026",
    prioridad: "Baja",
    anonimo: true,
    evidencias: [],
    animales: "Sin determinar",
    estado: "Descartada",
    seguimiento: [
      { fecha: "12/06/2026", titulo: "Denuncia recibida", detalle: "Reporte sin evidencia ni dirección exacta." },
      { fecha: "14/06/2026", titulo: "Descartada", detalle: "No fue posible verificar los hechos en el punto indicado." },
    ],
  },
];

export const conversaciones: Conversacion[] = [
  {
    id: "cv1",
    nombre: "Equipo de adopciones",
    avatar: pet1,
    ultimo: "Perfecto, la entrevista queda el martes.",
    hora: "10:24",
    noLeidos: 2,
    mensajes: [
      { id: "m1", autor: "ellos", texto: "¡Hola María! Recibimos tu solicitud por Canela.", hora: "09:58" },
      { id: "m2", autor: "yo", texto: "¡Hola! Sí, estoy muy emocionada.", hora: "10:05" },
      { id: "m3", autor: "ellos", texto: "¿Te sirve una entrevista el martes a las 10:00?", hora: "10:20" },
      { id: "m4", autor: "yo", texto: "Sí, perfecto.", hora: "10:22" },
      { id: "m5", autor: "ellos", texto: "Perfecto, la entrevista queda el martes.", hora: "10:24" },
    ],
  },
  {
    id: "cv2",
    nombre: "Voluntariado",
    avatar: pet2,
    ultimo: "Te comparto el cronograma de la jornada.",
    hora: "Ayer",
    noLeidos: 0,
    mensajes: [
      { id: "m1", autor: "ellos", texto: "Te comparto el cronograma de la jornada.", hora: "16:40", adjunto: "cronograma-jornada.pdf" },
    ],
  },
  {
    id: "cv3",
    nombre: "Tienda solidaria",
    avatar: pet3,
    ultimo: "Tu pedido fue enviado.",
    hora: "Lun",
    noLeidos: 0,
    mensajes: [{ id: "m1", autor: "ellos", texto: "Tu pedido #o1 fue enviado.", hora: "12:10" }],
  },
];

export const notificaciones: Notificacion[] = [
  { id: "nt1", titulo: "Entrevista agendada", detalle: "Tu entrevista por Canela es el martes 10:00 a.m.", fecha: "Hace 2 h", grupo: "Hoy", leida: false, tipo: "solicitud" },
  { id: "nt2", titulo: "Nuevo mensaje", detalle: "Equipo de adopciones respondió tu consulta.", fecha: "Hace 5 h", grupo: "Hoy", leida: false, tipo: "mensaje" },
  { id: "nt3", titulo: "Donación recibida", detalle: "Gracias por tu aporte a la campaña Invierno cálido.", fecha: "Hace 3 días", grupo: "Esta semana", leida: true, tipo: "donacion" },
  { id: "nt4", titulo: "Evento próximo", detalle: "Jornada de adopción el 09/08 en Bogotá.", fecha: "Hace 5 días", grupo: "Esta semana", leida: true, tipo: "evento" },
  { id: "nt5", titulo: "Actualización de perfil", detalle: "Tus datos personales fueron actualizados.", fecha: "12/06/2026", grupo: "Anteriores", leida: true, tipo: "sistema" },
];

export const kpis = {
  mascotas: 84,
  adoptadas: 312,
  donaciones: 18450000,
  familias: 276,
};

export const adopcionesPorMes = [
  { mes: "Feb", adopciones: 18, solicitudes: 34 },
  { mes: "Mar", adopciones: 24, solicitudes: 41 },
  { mes: "Abr", adopciones: 21, solicitudes: 38 },
  { mes: "May", adopciones: 29, solicitudes: 52 },
  { mes: "Jun", adopciones: 38, solicitudes: 61 },
  { mes: "Jul", adopciones: 31, solicitudes: 47 },
];

export const donacionesPorTipo = [
  { tipo: "Dinero", valor: 42 },
  { tipo: "Alimentos", valor: 24 },
  { tipo: "Medicamentos", valor: 14 },
  { tipo: "Juguetes", valor: 11 },
  { tipo: "Cobijas", valor: 9 },
];

export const actividadReciente = [
  { id: "ar1", texto: "Nueva solicitud de adopción por Pelusa", tiempo: "Hace 15 min" },
  { id: "ar2", texto: "Donación de 20 kg de concentrado registrada", tiempo: "Hace 1 h" },
  { id: "ar3", texto: "Mascota Bruno pasó a estado En tratamiento", tiempo: "Hace 3 h" },
  { id: "ar4", texto: "Pedido #o3 en preparación", tiempo: "Ayer" },
  { id: "ar5", texto: "Denuncia DEN-2026-014 en revisión", tiempo: "Ayer" },
];

export const historias = [
  { id: "h1", nombre: "Mia y la familia Ortiz", texto: "Llegó tímida y hoy duerme sobre el sofá como si siempre hubiera vivido aquí.", imagen: pet2 },
  { id: "h2", nombre: "Simón y Andrés", texto: "Adoptar a Simón me devolvió las caminatas de la mañana y muchísima compañía.", imagen: pet1 },
  { id: "h3", nombre: "Kira y las niñas", texto: "Nuestras hijas aprendieron a cuidar y respetar con Kira en casa.", imagen: pet3 },
];
