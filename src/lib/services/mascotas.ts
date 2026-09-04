import { supabase } from "@/lib/supabase";
import { mascotas as mockMascotas, imagenesPerros, imagenesGatos } from "@/mock/mascotas";
import type { Mascota } from "@/types";
import type { Database } from "@/types/database.types";

type MascotaRow = Database["public"]["Tables"]["mascotas"]["Row"];
type MascotaInsert = Database["public"]["Tables"]["mascotas"]["Insert"];

/**
 * Mapa de imágenes taxonómicamente correctas de respaldo
 * por nombre de mascota para conservar coherencia visual impecable.
 */
const galeriaPorNombre: Record<string, string[]> = {};
mockMascotas.forEach((m) => {
  galeriaPorNombre[m.nombre.trim().toLowerCase()] = m.galeria;
});

/**
 * Convierte un registro de la base de datos Supabase al formato `Mascota`
 * usado por la interfaz de usuario.
 */
export function mapearMascotaDesdeDB(row: MascotaRow): Mascota {
  const nombreKey = (row.nombre || "").trim().toLowerCase();
  let galeria: string[] = [];

  if (Array.isArray(row.galeria) && row.galeria.length > 0 && row.galeria[0]) {
    galeria = row.galeria;
  } else if (galeriaPorNombre[nombreKey]) {
    galeria = galeriaPorNombre[nombreKey];
  } else if (row.especie === "Gato") {
    const idx = Math.abs(nombreKey.length) % imagenesGatos.length;
    galeria = [imagenesGatos[idx]];
  } else {
    const idx = Math.abs(nombreKey.length) % imagenesPerros.length;
    galeria = [imagenesPerros[idx]];
  }

  return {
    id: row.id,
    nombre: row.nombre,
    especie: row.especie,
    raza: row.raza,
    sexo: row.sexo,
    edad: row.edad,
    edadMeses: Number(row.edad_meses) || 0,
    peso: Number(row.peso) || 0,
    tamano: row.tamano,
    ciudad: row.ciudad,
    estado: row.estado,
    esterilizado: Boolean(row.esterilizado),
    vacunado: Boolean(row.vacunado),
    compatibleNinos: Boolean(row.compatible_ninos),
    compatibleMascotas: Boolean(row.compatible_mascotas),
    necesidadesEspeciales: Boolean(row.necesidades_especiales),
    energia: row.energia,
    personalidad: Array.isArray(row.personalidad) ? row.personalidad : [],
    historia: row.historia || "",
    salud: row.salud || "",
    vacunas: Array.isArray(row.vacunas)
      ? (row.vacunas as { nombre: string; fecha: string }[])
      : [],
    galeria,
    destacada: Boolean(row.destacada),
    ingreso: row.ingreso_fecha || "",
  };
}

/**
 * Obtiene todas las mascotas desde Supabase.
 * Si ocurre algún error o no hay conexión, usa los datos locales (fallback)
 * para garantizar que la interfaz nunca se rompa.
 */
export async function obtenerMascotas(): Promise<Mascota[]> {
  try {
    const { data, error } = await supabase
      .from("mascotas")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      console.warn("[Mascotas Service] Consulta Supabase con advertencia, usando fallback:", error.message);
      return mockMascotas;
    }

    if (!data || data.length === 0) {
      return mockMascotas;
    }

    return data.map(mapearMascotaDesdeDB);
  } catch (err) {
    console.warn("[Mascotas Service] Excepción conectando a Supabase:", err);
    return mockMascotas;
  }
}

/**
 * Obtiene una mascota específica por su ID.
 */
export async function obtenerMascotaPorId(id: string): Promise<Mascota | undefined> {
  try {
    const { data, error } = await supabase
      .from("mascotas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return mapearMascotaDesdeDB(data);
    }
  } catch (err) {
    console.warn("[Mascotas Service] Error consultando mascota por ID:", err);
  }

  // Fallback por ID o por coincidencia en mocks
  return mockMascotas.find((m) => m.id === id);
}

/**
 * Inserta una nueva mascota en Supabase.
 */
export async function crearMascota(formulario: Record<string, string>): Promise<Mascota> {
  const especie = (formulario.especie === "Gato" ? "Gato" : "Perro") as "Perro" | "Gato";
  const edadMeses = Number(formulario.edadMeses) || 12;
  const edadTexto =
    edadMeses < 12
      ? `${edadMeses} meses`
      : `${Math.floor(edadMeses / 12)} ${Math.floor(edadMeses / 12) === 1 ? "año" : "años"}`;

  const rowInsert: MascotaInsert = {
    nombre: (formulario.nombre || "").trim(),
    especie: especie,
    raza: (formulario.raza || "Criollo").trim(),
    sexo: formulario.sexo === "Hembra" ? "Hembra" : "Macho",
    edad: edadTexto,
    edad_meses: edadMeses,
    peso: Number(formulario.peso) || 5,
    tamano: (formulario.tamano as "Pequeño" | "Mediano" | "Grande") || "Mediano",
    ciudad: formulario.ciudad || "Bogotá",
    estado: (formulario.estado as "Disponible" | "En proceso" | "Adoptado" | "En tratamiento") || "Disponible",
    esterilizado: true,
    vacunado: true,
    compatible_ninos: true,
    compatible_mascotas: true,
    necesidades_especiales: false,
    energia: "Media",
    personalidad: ["Sociable", "Cariñoso"],
    historia: formulario.historia || "Rescatado recientemente.",
    salud: formulario.salud || "En buen estado de salud general.",
    destacada: false,
    galeria: formulario.foto ? [formulario.foto] : [],
    ingreso_fecha: formulario.ingreso || new Date().toLocaleDateString("es-CO"),
  };

  const { data, error } = await supabase
    .from("mascotas")
    .insert([rowInsert])
    .select()
    .single();

  if (error) {
    console.error("[Mascotas Service] Error al insertar en Supabase:", error);
    throw new Error(`Error en Supabase: ${error.message}`);
  }

  return mapearMascotaDesdeDB(data);
}

/**
 * Actualiza una mascota existente en Supabase.
 */
export async function actualizarMascota(
  id: string,
  formulario: Record<string, string>,
): Promise<Mascota> {
  const especie = (formulario.especie === "Gato" ? "Gato" : "Perro") as "Perro" | "Gato";
  const edadMeses = Number(formulario.edadMeses) || 12;
  const edadTexto =
    edadMeses < 12
      ? `${edadMeses} meses`
      : `${Math.floor(edadMeses / 12)} ${Math.floor(edadMeses / 12) === 1 ? "año" : "años"}`;

  const rowUpdate: Partial<MascotaInsert> = {
    nombre: (formulario.nombre || "").trim(),
    especie: especie,
    raza: (formulario.raza || "Criollo").trim(),
    sexo: formulario.sexo === "Hembra" ? "Hembra" : "Macho",
    edad: edadTexto,
    edad_meses: edadMeses,
    peso: Number(formulario.peso) || 5,
    tamano: (formulario.tamano as "Pequeño" | "Mediano" | "Grande") || "Mediano",
    ciudad: formulario.ciudad || "Bogotá",
    estado: (formulario.estado as "Disponible" | "En proceso" | "Adoptado" | "En tratamiento") || "Disponible",
    historia: formulario.historia || "",
    salud: formulario.salud || "",
    ingreso_fecha: formulario.ingreso || undefined,
  };

  if (formulario.foto) {
    rowUpdate.galeria = [formulario.foto];
  }

  const { data, error } = await supabase
    .from("mascotas")
    .update(rowUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Mascotas Service] Error al actualizar en Supabase:", error);
    throw new Error(`Error en Supabase: ${error.message}`);
  }

  return mapearMascotaDesdeDB(data);
}

/**
 * Elimina una mascota de Supabase por ID.
 */
export async function eliminarMascota(id: string): Promise<void> {
  const { error } = await supabase.from("mascotas").delete().eq("id", id);
  if (error) {
    console.error("[Mascotas Service] Error al eliminar de Supabase:", error);
    throw new Error(`Error en Supabase: ${error.message}`);
  }
}
