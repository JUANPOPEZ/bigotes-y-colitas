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
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim(),
  );
}

/**
 * Formatea de manera segura una fecha proveniente de la base de datos o cronología,
 * evitando 'Invalid Date' cuando la fecha contiene offsets de Postgres (ej. -05) o ya fue formateada.
 */
export function formatearFechaSegura(fechaStr?: string | null): string {
  if (!fechaStr) return "";
  const str = String(fechaStr).trim();
  if (!str || str === "Invalid Date") return "";

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  }

  // Si tiene offset de tipo -05 o +02 (dos dígitos tras el signo sin minutos)
  const conMinutos = str.replace(/([+-]\d{2})$/, "$1:00");
  const d2 = new Date(conMinutos);
  if (!isNaN(d2.getTime())) {
    return d2.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  }

  return str;
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
  correo?: string | null,
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
      console.warn(
        "[Solicitudes Service] Advertencia al consultar solicitudes activas:",
        error.message,
      );
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
  correo?: string | null,
): Promise<{ activas: number; restantes: number; permitido: boolean }> {
  const activas = await contarSolicitudesActivas(usuarioId, correo);
  return calcularDisponibilidadSolicitudes(activas);
}

/**
 * Verifica si el usuario ya tiene una solicitud activa para la misma mascota.
 */
export async function verificarSolicitudDuplicada(
  mascotaId: string,
  usuarioId?: string | null,
  correo?: string | null,
): Promise<boolean> {
  const usuarioIdValido = esUuidValido(usuarioId) ? usuarioId : null;
  const correoLimpio = correo?.trim().toLowerCase();

  if (!usuarioIdValido && !correoLimpio) return false;

  let query = supabase
    .from("solicitudes_adopcion")
    .select("id")
    .eq("mascota_id", mascotaId)
    .in("estado", ESTADOS_EN_TRAMITE);

  if (usuarioIdValido && correoLimpio) {
    query = query.or(`usuario_id.eq.${usuarioIdValido},correo.eq.${correoLimpio}`);
  } else if (usuarioIdValido) {
    query = query.eq("usuario_id", usuarioIdValido);
  } else if (correoLimpio) {
    query = query.eq("correo", correoLimpio);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("[Solicitudes Service] Error al verificar duplicidad:", error.message);
    return false; // Asumimos false si falla la red, la inserción lo atrapará después
  }

  return (data && data.length > 0) || false;
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
  datos: FormularioSolicitudInput,
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
    throw new Error(
      "Por favor cuéntanos detalladamente por qué deseas adoptar (mínimo 10 caracteres).",
    );
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
          `La mascota "${mascotaDB.nombre}" ya no se encuentra disponible (estado actual: ${mascotaDB.estado}). Solo se pueden solicitar mascotas en estado Disponible.`,
        );
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Disponible")) {
      throw err;
    }
    console.warn("[Solicitudes Service] No se pudo verificar disponibilidad en Supabase:", err);
  }

  // 3. Verificar límite de 3 solicitudes activas y que no haya duplicidad para la misma mascota
  const activas = await contarSolicitudesActivas(datos.usuarioId, datos.correo);
  if (activas >= MAX_SOLICITUDES_ACTIVAS) {
    throw new Error(
      `Ya tienes ${activas} de ${MAX_SOLICITUDES_ACTIVAS} solicitudes activas en proceso. Debes esperar a que alguna se resuelva antes de crear una nueva.`,
    );
  }

  const usuarioIdValido = esUuidValido(datos.usuarioId) ? datos.usuarioId : null;
  const correoLimpio = datos.correo.trim().toLowerCase();

  let queryDuplicada = supabase
    .from("solicitudes_adopcion")
    .select("id")
    .eq("mascota_id", datos.mascotaId)
    .in("estado", ESTADOS_EN_TRAMITE);

  if (usuarioIdValido) {
    queryDuplicada = queryDuplicada.eq("usuario_id", usuarioIdValido);
  } else {
    queryDuplicada = queryDuplicada.eq("correo", correoLimpio);
  }

  const { data: duplicadas, error: errorDup } = await queryDuplicada;
  if (!errorDup && duplicadas && duplicadas.length > 0) {
    throw new Error(
      "Ya tienes una solicitud en proceso para esta misma mascota. Por favor, espera a que se resuelva.",
    );
  }

  // 4. Generación de radicado único
  const radicado = generarRadicadoUnico();
  const fechaActual = new Date().toISOString();

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
        console.warn(
          "[Solicitudes Service] Columna faltante en DB remota (código 42703), reintentando con esquema base...",
        );
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
          "Ya tienes 3 solicitudes activas en proceso de adopción. Debes esperar a que se resuelva alguna para postular una nueva.",
        );
      }

      // Si PostgreSQL bloquea por RLS (falta de política INSERT en Supabase)
      if (error.code === "42501" || error.message.includes("row-level security")) {
        throw new Error(
          "Supabase bloqueó el registro: la tabla 'solicitudes_adopcion' tiene RLS activado pero aún no tiene la política de inserción. Ejecuta el script de migración en el SQL Editor de Supabase.",
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
    const mensaje =
      err instanceof Error ? err.message : "Error inesperado al registrar la solicitud.";
    console.error("[Solicitudes Service] Error registrando solicitud:", err);
    throw new Error(mensaje);
  }
}

/**
 * Obtiene todas las solicitudes del usuario actual desde Supabase.
 */
export async function obtenerSolicitudesUsuario(
  usuarioId?: string | null,
  correo?: string | null,
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
      console.warn(
        "[Solicitudes Service] Error al consultar solicitudes del usuario:",
        error.message,
      );
      return [];
    }

    if (!data) return [];

    return data.map((row) => {
      const mascotaInfo = (
        row as unknown as {
          mascotas?: { id: string; nombre: string; especie: string; ciudad: string };
        }
      ).mascotas;
      const datosHogar = (row.datos_hogar || {}) as Record<string, unknown>;
      const nombreMascota =
        mascotaInfo?.nombre || (datosHogar.nombre_mascota as string) || "Mascota";
      const crono = Array.isArray(row.cronologia) ? row.cronologia : [];

      return {
        id: row.id,
        radicado:
          (row as unknown as { radicado?: string }).radicado ||
          (datosHogar.radicado as string) ||
          undefined,
        mascota: nombreMascota,
        mascotaId: row.mascota_id,
        solicitante: row.solicitante,
        correo: row.correo,
        ciudad: row.ciudad,
        fecha: formatearFechaSegura(row.creado_en),
        estado: row.estado as import("@/types").EstadoSolicitud,
        cronologia: (crono as Array<{ fecha?: string; titulo?: string; detalle?: string }>).map(
          (c) => ({
            fecha: formatearFechaSegura(c.fecha),
            titulo: c.titulo || "",
            detalle: c.detalle || "",
          }),
        ),
        datosFormulario: row.datos_formulario,
        telefono: row.telefono,
      };
    });
  } catch (err) {
    console.error("[Solicitudes Service] Error cargando solicitudes:", err);
    return [];
  }
}

/**
 * Obtiene TODAS las solicitudes para el panel de administración.
 */
export async function obtenerTodasLasSolicitudes(): Promise<import("@/types").Solicitud[]> {
  try {
    const { data, error } = await supabase
      .from("solicitudes_adopcion")
      .select("*, mascotas(id, nombre, especie, ciudad, galeria)")
      .order("creado_en", { ascending: false });

    if (error) {
      console.warn(
        "[Solicitudes Service] Error al consultar todas las solicitudes:",
        error.message,
      );
      return [];
    }

    if (!data) return [];

    return data.map((row) => {
      const mascotaInfo = (
        row as unknown as {
          mascotas?: {
            id: string;
            nombre: string;
            especie: string;
            ciudad: string;
            galeria?: string[];
          };
        }
      ).mascotas;
      const datosHogar = (row.datos_hogar || {}) as Record<string, unknown>;
      const datosForm = (row.datos_formulario || {}) as Record<string, unknown>;
      const nombreMascota =
        mascotaInfo?.nombre || (datosHogar.nombre_mascota as string) || "Mascota";
      const crono = Array.isArray(row.cronologia) ? row.cronologia : [];

      return {
        id: row.id,
        radicado:
          (row as unknown as { radicado?: string }).radicado ||
          (datosHogar.radicado as string) ||
          undefined,
        mascota: nombreMascota,
        mascotaId: row.mascota_id,
        solicitante: row.solicitante,
        correo: row.correo,
        ciudad: row.ciudad,
        fecha: formatearFechaSegura(row.creado_en),
        estado: row.estado as import("@/types").EstadoSolicitud,
        cronologia: (crono as Array<{ fecha?: string; titulo?: string; detalle?: string }>).map(
          (c) => ({
            fecha: formatearFechaSegura(c.fecha),
            titulo: c.titulo || "",
            detalle: c.detalle || "",
          }),
        ),
        datosFormulario: row.datos_formulario,
        telefono: row.telefono,
        // Campos aditivos para HU-09 (sin alterar campos existentes)
        mascotaEspecie: mascotaInfo?.especie,
        mascotaFoto:
          Array.isArray(mascotaInfo?.galeria) && mascotaInfo.galeria.length > 0
            ? mascotaInfo.galeria[0]
            : undefined,
        documento: (datosHogar.documento as string) || (datosForm.documento as string) || undefined,
      };
    });
  } catch (err) {
    console.error("[Solicitudes Service] Error cargando todas las solicitudes:", err);
    return [];
  }
}

/**
 * Permite a un adoptante cancelar (eliminar) su solicitud si aún está en estado "Pendiente".
 */
export async function eliminarSolicitudPendiente(id: string): Promise<void> {
  try {
    // Verificar estado actual
    const { data: actual, error: errorGet } = await supabase
      .from("solicitudes_adopcion")
      .select("estado")
      .eq("id", id)
      .single();

    if (errorGet) throw errorGet;
    if (actual.estado !== "Pendiente") {
      throw new Error("Solo puedes cancelar solicitudes que están en estado Pendiente.");
    }

    const { error: errorDelete } = await supabase
      .from("solicitudes_adopcion")
      .delete()
      .eq("id", id)
      .eq("estado", "Pendiente");

    if (errorDelete) throw errorDelete;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al cancelar la solicitud.";
    console.error("[Solicitudes Service] Error al eliminar:", err);
    throw new Error(msg);
  }
}

/**
 * Permite a un administrador eliminar permanentemente una solicitud del sistema.
 */
export async function eliminarSolicitudAdmin(id: string): Promise<void> {
  try {
    const { error: errorDelete } = await supabase
      .from("solicitudes_adopcion")
      .delete()
      .eq("id", id);

    if (errorDelete) throw errorDelete;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al eliminar la solicitud.";
    console.error("[Solicitudes Service] Error al eliminar (Admin):", err);
    throw new Error(msg);
  }
}

/**
 * Actualiza el estado de una solicitud y agrega notas a su cronología.
 */
export async function actualizarEstadoSolicitud(
  id: string,
  nuevoEstado: EstadoSolicitud,
  observaciones?: string,
  tituloObservacion?: string,
) {
  try {
    // Primero, obtenemos la cronología actual y el id de la mascota
    const { data: actual, error: errorGet } = await supabase
      .from("solicitudes_adopcion")
      .select("cronologia, estado, mascota_id")
      .eq("id", id)
      .single();

    if (errorGet) throw errorGet;

    const cronologiaAnterior = Array.isArray(actual.cronologia) ? actual.cronologia : [];

    // Si no nos pasan un título explícito desde el frontend, lo inferimos basado en el nuevo estado
    let tituloNuevo = tituloObservacion || `Cambio de estado a ${nuevoEstado}`;
    const detalleNuevo =
      observaciones?.trim() || `La solicitud ha avanzado al estado: ${nuevoEstado}`;

    if (!tituloObservacion) {
      if (nuevoEstado === "Entrevista") {
        tituloNuevo = "Entrevista programada/realizada";
      } else if (nuevoEstado === "Visita") {
        tituloNuevo = "Visita domiciliaria";
      } else if (nuevoEstado === "Aprobada") {
        tituloNuevo = "Solicitud Aprobada";
      } else if (nuevoEstado === "Rechazada") {
        tituloNuevo = "Solicitud Rechazada";
      }
    }

    const nuevoItemCronologia = {
      fecha: new Date().toISOString(),
      titulo: tituloNuevo,
      detalle: detalleNuevo,
    };

    // Actualizamos con la nueva cronologia
    const { error: errorUpdate } = await supabase
      .from("solicitudes_adopcion")
      .update({
        estado: nuevoEstado,
        cronologia: [...cronologiaAnterior, nuevoItemCronologia],
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id);

    if (errorUpdate) throw errorUpdate;

    // --- Automatizaciones de la Mascota ---
    if (actual.mascota_id) {
      // 1. Cuando la solicitud pasa a "Entrevista", la mascota pasa a "En proceso"
      if (nuevoEstado === "Entrevista") {
        await supabase
          .from("mascotas")
          .update({ estado: "En proceso" })
          .eq("id", actual.mascota_id);
      }
      // 2. Cuando la solicitud pasa a "Entregado", la mascota pasa a "Adoptado"
      else if (nuevoEstado === "Entregado") {
        await supabase.from("mascotas").update({ estado: "Adoptado" }).eq("id", actual.mascota_id);

        // 3. Auto-rechazar las demás solicitudes para esta misma mascota
        const { data: otrasSolicitudes } = await supabase
          .from("solicitudes_adopcion")
          .select("id, cronologia")
          .eq("mascota_id", actual.mascota_id)
          .neq("id", id)
          .neq("estado", "Rechazada");

        if (otrasSolicitudes && otrasSolicitudes.length > 0) {
          const itemRechazoAuto = {
            fecha: new Date().toISOString(),
            titulo: "Solicitud Rechazada Automáticamente",
            detalle:
              "Lo sentimos, esta mascota ya ha encontrado un hogar definitivo con otra familia. Tu cupo de solicitud ha sido liberado para que puedas postularte a otra mascota.",
          };

          for (const otra of otrasSolicitudes) {
            const cronoOtra = Array.isArray(otra.cronologia) ? otra.cronologia : [];
            await supabase
              .from("solicitudes_adopcion")
              .update({
                estado: "Rechazada",
                cronologia: [...cronoOtra, itemRechazoAuto],
                actualizado_en: new Date().toISOString(),
              })
              .eq("id", otra.id);
          }
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar la solicitud";
    console.error("[Solicitudes Service] Error actualizando estado:", err);
    throw new Error(msg);
  }
}

/**
 * Registra formalmente la entrega de una mascota para una solicitud aprobada (HU-09).
 * Invoca la función RPC atómica en Supabase que valida permisos de admin, actualiza
 * la solicitud a 'Entregado', la mascota a 'Adoptado', añade el evento a la cronología
 * y crea el registro formal en la tabla 'adopciones'.
 */
export async function registrarEntregaSolicitud(
  solicitudId: string,
  observaciones?: string,
): Promise<{
  success: boolean;
  radicado?: string;
  adopcionId?: string;
  mensaje?: string;
}> {
  if (!solicitudId || !esUuidValido(solicitudId)) {
    throw new Error("El identificador de la solicitud es inválido.");
  }

  try {
    const { data, error } = await supabase.rpc("registrar_entrega_mascota", {
      p_solicitud_id: solicitudId,
      p_observaciones: observaciones?.trim() || null,
    });

    if (error) {
      if (error.code === "42883" || error.message.includes("does not exist")) {
        throw new Error(
          "La función 'registrar_entrega_mascota' aún no existe en Supabase. Por favor ejecuta el script SQL de migración en el SQL Editor de Supabase.",
        );
      }
      throw new Error(error.message || "Error al registrar la entrega de la mascota en Supabase.");
    }

    return (
      (data as unknown as {
        success: boolean;
        radicado?: string;
        adopcionId?: string;
        mensaje?: string;
      }) || {
        success: true,
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error inesperado al registrar la entrega.";
    console.error("[Solicitudes Service] Error registrando entrega:", err);
    throw new Error(msg);
  }
}
