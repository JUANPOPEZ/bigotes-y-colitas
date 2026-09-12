export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RolUsuario = "visitante" | "adoptante" | "administrador";
export type EstadoMascota = "Disponible" | "En proceso" | "Adoptado" | "En tratamiento";
export type EspecieMascota = "Perro" | "Gato";
export type SexoMascota = "Macho" | "Hembra";
export type TamanoMascota = "Pequeño" | "Mediano" | "Grande";
export type EnergiaMascota = "Baja" | "Media" | "Alta";
export type EstadoSolicitud =
  | "Pendiente"
  | "En revisión"
  | "Entrevista"
  | "Visita"
  | "Aprobada"
  | "Entregado"
  | "Rechazada";
export type TipoDonacion =
  | "Dinero"
  | "Alimentos"
  | "Medicamentos"
  | "Juguetes"
  | "Cobijas"
  | "Accesorios";
export type EstadoDonacion = "Recibida" | "Pendiente" | "En tránsito";
export type EstadoPedido = "Pendiente" | "Preparando" | "Enviado" | "Entregado" | "Cancelado";
export type PrioridadDenuncia = "Alta" | "Media" | "Baja";
export type EstadoDenuncia =
  | "Recibida"
  | "En revisión"
  | "Verificación en campo"
  | "Atendida"
  | "Cerrada"
  | "Descartada";

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          nombre: string;
          correo: string;
          rol: RolUsuario;
          ciudad: string;
          telefono: string | null;
          avatar_url: string | null;
          estado: "Activo" | "Inactivo";
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id: string;
          nombre: string;
          correo: string;
          rol?: RolUsuario;
          ciudad?: string;
          telefono?: string | null;
          avatar_url?: string | null;
          estado?: "Activo" | "Inactivo";
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          correo?: string;
          rol?: RolUsuario;
          ciudad?: string;
          telefono?: string | null;
          avatar_url?: string | null;
          estado?: "Activo" | "Inactivo";
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      mascotas: {
        Row: {
          id: string;
          nombre: string;
          especie: EspecieMascota;
          raza: string;
          sexo: SexoMascota;
          edad: string;
          edad_meses: number;
          peso: number;
          tamano: TamanoMascota;
          ciudad: string;
          estado: EstadoMascota;
          esterilizado: boolean;
          vacunado: boolean;
          compatible_ninos: boolean;
          compatible_mascotas: boolean;
          necesidades_especiales: boolean;
          energia: EnergiaMascota;
          personalidad: string[];
          historia: string;
          salud: string;
          vacunas: Json;
          galeria: string[];
          destacada: boolean;
          ingreso_fecha: string;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          especie: EspecieMascota;
          raza: string;
          sexo: SexoMascota;
          edad: string;
          edad_meses: number;
          peso: number;
          tamano: TamanoMascota;
          ciudad: string;
          estado?: EstadoMascota;
          esterilizado?: boolean;
          vacunado?: boolean;
          compatible_ninos?: boolean;
          compatible_mascotas?: boolean;
          necesidades_especiales?: boolean;
          energia?: EnergiaMascota;
          personalidad?: string[];
          historia: string;
          salud?: string;
          vacunas?: Json;
          galeria?: string[];
          destacada?: boolean;
          ingreso_fecha?: string;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          especie?: EspecieMascota;
          raza?: string;
          sexo?: SexoMascota;
          edad?: string;
          edad_meses?: number;
          peso?: number;
          tamano?: TamanoMascota;
          ciudad?: string;
          estado?: EstadoMascota;
          esterilizado?: boolean;
          vacunado?: boolean;
          compatible_ninos?: boolean;
          compatible_mascotas?: boolean;
          necesidades_especiales?: boolean;
          energia?: EnergiaMascota;
          personalidad?: string[];
          historia?: string;
          salud?: string;
          vacunas?: Json;
          galeria?: string[];
          destacada?: boolean;
          ingreso_fecha?: string;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      solicitudes_adopcion: {
        Row: {
          id: string;
          mascota_id: string;
          usuario_id: string | null;
          solicitante: string;
          correo: string;
          telefono: string | null;
          ciudad: string;
          estado: EstadoSolicitud;
          datos_hogar: Json | null;
          cronologia: Json;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          mascota_id: string;
          usuario_id?: string | null;
          solicitante: string;
          correo: string;
          telefono?: string | null;
          ciudad: string;
          estado?: EstadoSolicitud;
          datos_hogar?: Json | null;
          cronologia?: Json;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: string;
          mascota_id?: string;
          usuario_id?: string | null;
          solicitante?: string;
          correo?: string;
          telefono?: string | null;
          ciudad?: string;
          estado?: EstadoSolicitud;
          datos_hogar?: Json | null;
          cronologia?: Json;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      donaciones: {
        Row: {
          id: string;
          usuario_id: string | null;
          donante: string;
          correo: string | null;
          tipo: TipoDonacion;
          detalle: string;
          monto: number | null;
          estado: EstadoDonacion;
          preferencia_pago_id: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string | null;
          donante: string;
          correo?: string | null;
          tipo: TipoDonacion;
          detalle: string;
          monto?: number | null;
          estado?: EstadoDonacion;
          preferencia_pago_id?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string | null;
          donante?: string;
          correo?: string | null;
          tipo?: TipoDonacion;
          detalle?: string;
          monto?: number | null;
          estado?: EstadoDonacion;
          preferencia_pago_id?: string | null;
          creado_en?: string;
        };
      };
      campanas: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          meta: number;
          recaudado: number;
          cierre_fecha: string;
          imagen_url: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descripcion: string;
          meta: number;
          recaudado?: number;
          cierre_fecha: string;
          imagen_url?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          descripcion?: string;
          meta?: number;
          recaudado?: number;
          cierre_fecha?: string;
          imagen_url?: string | null;
          creado_en?: string;
        };
      };
      productos: {
        Row: {
          id: string;
          nombre: string;
          categoria: string;
          precio: number;
          stock: number;
          descripcion: string;
          imagen_url: string;
          destacado: boolean;
          creado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          categoria: string;
          precio: number;
          stock?: number;
          descripcion: string;
          imagen_url: string;
          destacado?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          categoria?: string;
          precio?: number;
          stock?: number;
          descripcion?: string;
          imagen_url?: string;
          destacado?: boolean;
          creado_en?: string;
        };
      };
      pedidos: {
        Row: {
          id: string;
          usuario_id: string | null;
          cliente: string;
          correo: string;
          telefono: string | null;
          direccion: string | null;
          ciudad: string;
          total: number;
          articulos_cantidad: number;
          estado: EstadoPedido;
          preferencia_pago_id: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string | null;
          cliente: string;
          correo: string;
          telefono?: string | null;
          direccion?: string | null;
          ciudad?: string;
          total: number;
          articulos_cantidad?: number;
          estado?: EstadoPedido;
          preferencia_pago_id?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string | null;
          cliente?: string;
          correo?: string;
          telefono?: string | null;
          direccion?: string | null;
          ciudad?: string;
          total?: number;
          articulos_cantidad?: number;
          estado?: EstadoPedido;
          preferencia_pago_id?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      eventos: {
        Row: {
          id: string;
          titulo: string;
          fecha: string;
          hora: string;
          lugar: string;
          ciudad: string;
          cupos: number;
          inscritos: number;
          descripcion: string;
          imagen_url: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          fecha: string;
          hora: string;
          lugar: string;
          ciudad: string;
          cupos: number;
          inscritos?: number;
          descripcion: string;
          imagen_url?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          fecha?: string;
          hora?: string;
          lugar?: string;
          ciudad?: string;
          cupos?: number;
          inscritos?: number;
          descripcion?: string;
          imagen_url?: string | null;
          creado_en?: string;
        };
      };
      denuncias: {
        Row: {
          id: string;
          folio: string;
          tipo: string;
          ciudad: string;
          ubicacion: string;
          descripcion: string;
          fecha_hecho: string;
          prioridad: PrioridadDenuncia;
          anonimo: boolean;
          usuario_id: string | null;
          denunciante: string | null;
          contacto: string | null;
          evidencias: string[];
          responsable: string | null;
          animales: string;
          estado: EstadoDenuncia;
          seguimiento: Json;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          folio: string;
          tipo: string;
          ciudad: string;
          ubicacion: string;
          descripcion: string;
          fecha_hecho: string;
          prioridad?: PrioridadDenuncia;
          anonimo?: boolean;
          usuario_id?: string | null;
          denunciante?: string | null;
          contacto?: string | null;
          evidencias?: string[];
          responsable?: string | null;
          animales: string;
          estado?: EstadoDenuncia;
          seguimiento?: Json;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          id?: string;
          folio?: string;
          tipo?: string;
          ciudad?: string;
          ubicacion?: string;
          descripcion?: string;
          fecha_hecho?: string;
          prioridad?: PrioridadDenuncia;
          anonimo?: boolean;
          usuario_id?: string | null;
          denunciante?: string | null;
          contacto?: string | null;
          evidencias?: string[];
          responsable?: string | null;
          animales?: string;
          estado?: EstadoDenuncia;
          seguimiento?: Json;
          creado_en?: string;
          actualizado_en?: string;
        };
      };
      notificaciones: {
        Row: {
          id: string;
          usuario_id: string;
          titulo: string;
          detalle: string;
          tipo: "solicitud" | "mensaje" | "donacion" | "evento" | "sistema";
          leida: boolean;
          creado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          titulo: string;
          detalle: string;
          tipo: "solicitud" | "mensaje" | "donacion" | "evento" | "sistema";
          leida?: boolean;
          creado_en?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          titulo?: string;
          detalle?: string;
          tipo?: "solicitud" | "mensaje" | "donacion" | "evento" | "sistema";
          leida?: boolean;
          creado_en?: string;
        };
      };
    };
  };
}
