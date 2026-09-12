/**
 * Tipos de la interfaz (solo UI). NO son esquemas de base de datos.
 * Cuando exista la API REST, estos tipos se sustituyen por los DTO reales.
 */

export type Rol = "visitante" | "adoptante" | "administrador";

export type EstadoMascota = "Disponible" | "En proceso" | "Adoptado" | "En tratamiento";

export interface Mascota {
  id: string;
  nombre: string;
  especie: "Perro" | "Gato";
  raza: string;
  sexo: "Macho" | "Hembra";
  edad: string;
  edadMeses: number;
  peso: number;
  tamano: "Pequeño" | "Mediano" | "Grande";
  ciudad: string;
  estado: EstadoMascota;
  esterilizado: boolean;
  vacunado: boolean;
  compatibleNinos: boolean;
  compatibleMascotas: boolean;
  necesidadesEspeciales: boolean;
  energia: "Baja" | "Media" | "Alta";
  personalidad: string[];
  historia: string;
  salud: string;
  vacunas: { nombre: string; fecha: string }[];
  galeria: string[];
  destacada: boolean;
  ingreso: string;
}

export type EstadoSolicitud =
  | "Pendiente"
  | "En revisión"
  | "Entrevista"
  | "Visita"
  | "Aprobada"
  | "Entregado"
  | "Rechazada";

export interface Solicitud {
  id: string;
  mascota: string;
  mascotaId: string;
  solicitante: string;
  correo: string;
  ciudad: string;
  fecha: string;
  estado: EstadoSolicitud;
  cronologia: { fecha: string; titulo: string; detalle: string }[];
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  ciudad: string;
  estado: "Activo" | "Inactivo";
  registro: string;
  avatar?: string;
}

export interface Donacion {
  id: string;
  donante: string;
  tipo: "Dinero" | "Alimentos" | "Medicamentos" | "Juguetes" | "Cobijas" | "Accesorios";
  detalle: string;
  monto?: number;
  fecha: string;
  estado: "Recibida" | "Pendiente" | "En tránsito";
}

export interface Campana {
  id: string;
  titulo: string;
  descripcion: string;
  meta: number;
  recaudado: number;
  cierre: string;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagen: string;
  destacado: boolean;
}

export interface Pedido {
  id: string;
  cliente: string;
  fecha: string;
  total: number;
  articulos: number;
  estado: "Pendiente" | "Preparando" | "Enviado" | "Entregado" | "Cancelado";
}

export interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
  ciudad: string;
  cupos: number;
  inscritos: number;
  descripcion: string;
  imagen: string;
}

export type EstadoDenuncia =
  | "Recibida"
  | "En revisión"
  | "Verificación en campo"
  | "Atendida"
  | "Cerrada"
  | "Descartada";

export interface Denuncia {
  id: string;
  folio: string;
  tipo: string;
  ciudad: string;
  ubicacion: string;
  descripcion: string;
  fecha: string;
  fechaHecho: string;
  prioridad: "Alta" | "Media" | "Baja";
  anonimo: boolean;
  denunciante?: string;
  contacto?: string;
  evidencias: string[];
  responsable?: string;
  animales: string;
  estado: EstadoDenuncia;
  seguimiento: { fecha: string; titulo: string; detalle: string }[];
}

export interface Mensaje {
  id: string;
  autor: "yo" | "ellos";
  texto: string;
  hora: string;
  adjunto?: string;
}

export interface Conversacion {
  id: string;
  nombre: string;
  avatar: string;
  ultimo: string;
  hora: string;
  noLeidos: number;
  mensajes: Mensaje[];
}

export interface Notificacion {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  grupo: "Hoy" | "Esta semana" | "Anteriores";
  leida: boolean;
  tipo: "solicitud" | "mensaje" | "donacion" | "evento" | "sistema";
}
