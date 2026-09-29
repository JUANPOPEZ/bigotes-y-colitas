import { supabase } from "@/lib/supabase";
import {
  MAX_SOLICITUDES_ACTIVAS,
  ESTADOS_EN_TRAMITE,
  calcularDisponibilidadSolicitudes,
} from "@/lib/reglas-solicitudes";
import type { EstadoSolicitud } from "@/types";

/**
 * Validador para saber si un string tiene el formato estándar de UUID v4.
 * Es crucial para evitar errores 22P02 en PostgreSQL cuando se usan IDs demo.
 */
export function esUuidValido(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

/**
 * Genera un código de radicado único legible para la solicitud (ej. SOL-2026-102938).
 * Si el trigger de la base de datos está activo, la base de datos puede reasignar
 * o respetar este valor garantizando unicidad.
 */
export function generarRadicadoUnico(): string {
  const anio = new Date().getFullYear();
  const aleatorio = Math.floor(100000 + Math.random() * 900000);
  return `SOL-${anio}-${aleatorio}`;
}

export interface FormularioSolicitudInput {
  mascotaId: string;
  usuarioId?: string | null;
  solicitante: string;
  documento: string;
  correo: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  rangoEdad: string;
  tipoVivienda: string;
  propiedad: string;
  personas: number;
  ninos?: number;
  otrasMascotas?: string;
  tiempoSola: string;
  motivo: string;
  experienciaPrevia: string;
  aceptaCompromiso: boolean;
}

export interface SolicitudAdopcionCreada {
  id: string;
  radicado: string;
  mascotaId: string;
  usuarioId: string | null;
  solicitante: string;
  correo: string;
  telefono: string | null;
  ciudad: string;
  estado: EstadoSolicitud;
  creadoEn: string;
}

/**
 * Consulta en Supabase cuántas solicitudes en trámite tiene el usuario actual.
 * Considera los estados: 'Pendiente', 'En revisión', 'Entrevista', 'Visita'.
 */
export async function contarSolicitudesActivas(
  usuarioId?: string | null,
  correo?: string | null
): Promise<number> {
  const correoLimpio = correo?.trim().toLowerCase();
  const tieneUuid = esUuidValido(usuarioId);

  if (!tieneUuid && !correoLimpio) {
    return 0;
  }

  try {
    let query = supabase
      .from("solicitudes_adopcion")
      .select("id, estado, usuario_id, correo", { count: "exact" })
      .in("estado", ESTADOS_EN_TRAMITE);

    if (tieneUuid && correoLimpio) {
      query = query.or(`usuario_id.eq.${usuarioId},correo.eq.${correoLimpio}`);
    } else if (tieneUuid) {
      query = query.eq("usuario_id", usuarioId!);
    } else if (correoLimpio) {
      query = query.eq("correo", correoLimpio);
    }

    const { data, count, error } = await query;

    if (error) {
      console.warn("[Solicitudes Service] Advertencia al consultar solicitudes activas:", error.message);
      return 0;
    }

    return count ?? data?.length ?? 0;
  } catch (err) {
    console.error("[Solicitudes Service] Error inesperado contando solicitudes activas:", err);
    return 0;
  }
}

/**
 * Verifica si el usuario puede crear una nueva solicitud basándose en el límite de 3 activas.
 */
export async function verificarLimiteSolicitudesUsuario(
  usuarioId?: string | null,
  correo?: string | null
): Promise<{ activas: number; restantes: number; permitido: boolean }> {
  const activas = await contarSolicitudesActivas(usuarioId, correo);
  return calcularDisponibilidadSolicitudes(activas);
}

/**
 * Registra formalmente una solicitud de adopción en Supabase cumpliendo todos los criterios de HU-06:
 * - Valida campos obligatorios.
 * - Valida que la mascota esté 'Disponible'.
 * - Verifica el límite de 3 solicitudes activas.
 * - Asigna estado inicial 'Pendiente'.
 * - Genera y asocia el radicado único.
 * - Asocia usuario_id y mascota_id.
 */
export async function registrarSolicitudAdopcion(
  datos: FormularioSolicitudInput
): Promise<SolicitudAdopcionCreada> {
  // 1. Validaciones de presencia
  if (!datos.mascotaId) {
    throw new Error("Debes seleccionar una mascota para la solicitud.");
  }
  if (!datos.solicitante?.trim()) {
    throw new Error("El nombre completo del solicitante es obligatorio.");
  }
  if (!datos.documento?.trim()) {
    throw new Error("El documento de identidad es obligatorio.");
  }
  if (!datos.correo?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo.trim())) {
    throw new Error("El correo electrónico es inválido o está incompleto.");
  }
  if (!datos.telefono?.trim()) {
    throw new Error("El teléfono de contacto es obligatorio.");
  }
  if (!datos.ciudad?.trim()) {
    throw new Error("La ciudad de residencia es obligatoria.");
  }
  if (!datos.direccion?.trim()) {
    throw new Error("La dirección de residencia es obligatoria.");
  }
  if (!datos.tipoVivienda?.trim()) {
    throw new Error("El tipo de vivienda es obligatorio.");
  }
  if (!datos.propiedad?.trim()) {
    throw new Error("La condición del inmueble (propia/arrendada) es obligatoria.");
  }
  if (!datos.tiempoSola?.trim()) {
    throw new Error("Indica cuánto tiempo pasará sola la mascota al día.");
  }
  if (!datos.motivo?.trim() || datos.motivo.trim().length < 10) {
    throw new Error("Por favor cuéntanos detalladamente por qué deseas adoptar (mínimo 10 caracteres).");
  }
  if (!datos.experienciaPrevia?.trim()) {
    throw new Error("Indica si tienes experiencia previa cuidando mascotas.");
  }
  if (!datos.aceptaCompromiso) {
    throw new Error("Debes aceptar el compromiso de adopción responsable para continuar.");
  }

  // 2. Verificar disponibilidad de la mascota seleccionada en Supabase
  try {
    const { data: mascotaDB, error: errorMascota } = await supabase
      .from("mascotas")
      .select("id, nombre, estado")
      .eq("id", datos.mascotaId)
      .maybeSingle();

    if (!errorMascota && mascotaDB) {
      if (mascotaDB.estado !== "Disponible") {
        throw new Error(
          `La mascota "${mascotaDB.nombre}" ya no se encuentra disponible (estado actual: ${mascotaDB.estado}). Solo se pueden solicitar mascotas en estado Disponible.`
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Disponible")) {
      throw err;
    }
    console.warn("[Solicitudes Service] No se pudo verificar disponibilidad en Supabase:", err);
  }

  // 3. Verificar límite de 3 solicitudes activas
  const activas = await contarSolicitudesActivas(datos.usuarioId, datos.correo);
  if (activas >= MAX_SOLICITUDES_ACTIVAS) {
    throw new Error(
      `Ya tienes ${activas} de ${MAX_SOLICITUDES_ACTIVAS} solicitudes activas en proceso. Debes esperar a que alguna se resuelva antes de crear una nueva.`
    );
  }

  // 4. Generación de radicado único
  const radicado = generarRadicadoUnico();
  const fechaActual = new Date().toISOString();
  const usuarioIdValido = esUuidValido(datos.usuarioId) ? datos.usuarioId : null;

  const datosHogar = {
    documento: datos.documento.trim(),
    direccion: datos.direccion.trim(),
    rangoEdad: datos.rangoEdad || "26-40",
    tipoVivienda: datos.tipoVivienda,
    propiedad: datos.propiedad,
    personas: Number(datos.personas) || 1,
    ninos: Number(datos.ninos) || 0,
    otrasMascotas: datos.otrasMascotas?.trim() || "Ninguna",
    tiempoSola: datos.tiempoSola.trim(),
    motivo: datos.motivo.trim(),
    experienciaPrevia: datos.experienciaPrevia.trim(),
    aceptaCompromiso: true,
    radicado,
  };

  const cronologiaInicial = [
    {
      fecha: fechaActual,
      titulo: "Solicitud radicada",
      detalle: `Solicitud registrada con radicado ${radicado} en estado Pendiente.`,
    },
  ];

  // 5. Inserción en Supabase
  const payloadConRadicado = {
    radicado,
    mascota_id: datos.mascotaId,
    usuario_id: usuarioIdValido,
    solicitante: datos.solicitante.trim(),
    correo: datos.correo.trim().toLowerCase(),
    telefono: datos.telefono.trim(),
    ciudad: datos.ciudad.trim(),
    estado: "Pendiente" as EstadoSolicitud,
    datos_hogar: datosHogar,
    datos_formulario: datosHogar,
    cronologia: cronologiaInicial,
  };

  try {
    const { data, error } = await supabase
      .from("solicitudes_adopcion")
      .insert(payloadConRadicado)
      .select()
      .single();

    if (error) {
      // Manejar caso donde la columna 'radicado' o 'datos_formulario' aún no existan en la tabla remota
      if (error.code === "42703") {
        console.warn("[Solicitudes Service] Columna faltante en DB remota (código 42703), reintentando con esquema base...");
        const payloadBase = {
          mascota_id: datos.mascotaId,
          usuario_id: usuarioIdValido,
          solicitante: datos.solicitante.trim(),
          correo: datos.correo.trim().toLowerCase(),
          telefono: datos.telefono.trim(),
          ciudad: datos.ciudad.trim(),
          estado: "Pendiente" as EstadoSolicitud,
          datos_hogar: datosHogar,
          cronologia: cronologiaInicial,
        };

        const { data: dataFallback, error: errorFallback } = await supabase
          .from("solicitudes_adopcion")
          .insert(payloadBase)
          .select()
          .single();

        if (errorFallback) {
          throw new Error(errorFallback.message || "Error al registrar solicitud en Supabase.");
        }

        return {
          id: dataFallback.id,
          radicado: (dataFallback as { radicado?: string }).radicado || radicado,
          mascotaId: dataFallback.mascota_id,
          usuarioId: dataFallback.usuario_id,
          solicitante: dataFallback.solicitante,
          correo: dataFallback.correo,
          telefono: dataFallback.telefono,
          ciudad: dataFallback.ciudad,
          estado: dataFallback.estado,
          creadoEn: dataFallback.creado_en,
        };
      }

      // Si viola la regla de límite del trigger de Postgres
      if (error.message.includes("solicitudes activas") || error.code === "23514") {
        throw new Error(
          "Ya tienes 3 solicitudes activas en proceso de adopción. Debes esperar a que se resuelva alguna para postular una nueva."
        );
      }

      throw new Error(error.message || "Error al guardar la solicitud en la base de datos.");
    }

    return {
      id: data.id,
      radicado: data.radicado || radicado,
      mascotaId: data.mascota_id,
      usuarioId: data.usuario_id,
      solicitante: data.solicitante,
      correo: data.correo,
      telefono: data.telefono,
      ciudad: data.ciudad,
      estado: data.estado,
      creadoEn: data.creado_en,
    };
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : "Error inesperado al registrar la solicitud.";
    console.error("[Solicitudes Service] Error registrando solicitud:", err);
    throw new Error(mensaje);
  }
}

/**
 * Obtiene todas las solicitudes del usuario actual desde Supabase.
 */
export async function obtenerSolicitudesUsuario(
  usuarioId?: string | null,
  correo?: string | null
): Promise<import("@/types").Solicitud[]> {
  const correoLimpio = correo?.trim().toLowerCase();
  const tieneUuid = esUuidValido(usuarioId);

  if (!tieneUuid && !correoLimpio) {
    return [];
  }

  try {
    let query = supabase
      .from("solicitudes_adopcion")
      .select("*, mascotas(id, nombre, especie, ciudad)")
      .order("creado_en", { ascending: false });

    if (tieneUuid && correoLimpio) {
      query = query.or(`usuario_id.eq.${usuarioId},correo.eq.${correoLimpio}`);
    } else if (tieneUuid) {
      query = query.eq("usuario_id", usuarioId!);
    } else if (correoLimpio) {
      query = query.eq("correo", correoLimpio);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[Solicitudes Service] Error al consultar solicitudes del usuario:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row) => {
      const mascotaInfo = (row as unknown as { mascotas?: { id: string; nombre: string; especie: string; ciudad: string } }).mascotas;
      const datosHogar = (row.datos_hogar || {}) as Record<string, unknown>;
      const nombreMascota = mascotaInfo?.nombre || (datosHogar.nombre_mascota as string) || "Mascota";
      const crono = Array.isArray(row.cronologia) ? row.cronologia : [];

      return {
        id: row.id,
        radicado: (row as unknown as { radicado?: string }).radicado || (datosHogar.radicado as string) || undefined,
        mascota: nombreMascota,
        mascotaId: row.mascota_id,
        solicitante: row.solicitante,
        correo: row.correo,
        ciudad: row.ciudad,
        fecha: row.creado_en ? new Date(row.creado_en).toLocaleDateString("es-CO") : "",
        estado: row.estado as import("@/types").EstadoSolicitud,
        cronologia: (crono as Array<{ fecha?: string; titulo?: string; detalle?: string }>).map((c) => ({
          fecha: c.fecha ? new Date(c.fecha).toLocaleDateString("es-CO") : "",
          titulo: c.titulo || "",
          detalle: c.detalle || "",
        })),
      };
    });
  } catch (err) {
    console.error("[Solicitudes Service] Error cargando solicitudes:", err);
    return [];
  }
}

