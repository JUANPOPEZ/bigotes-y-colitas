import { supabase } from "@/lib/supabase";
import type { Usuario, Rol } from "@/types";

/**
 * Obtiene todos los perfiles de usuario.
 * Requiere que el usuario actual tenga rol 'administrador' (via RLS en Supabase).
 */
export async function obtenerTodosLosUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      console.warn("[Usuarios Service] Error al obtener usuarios:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      correo: row.correo,
      rol: row.rol as Rol,
      ciudad: row.ciudad,
      estado: row.estado as "Activo" | "Inactivo",
      registro: row.creado_en ? new Date(row.creado_en).toLocaleDateString("es-CO") : "",
      avatar: row.avatar_url,
    }));
  } catch (err) {
    console.error("[Usuarios Service] Error inesperado al listar usuarios:", err);
    return [];
  }
}

/**
 * Actualiza el rol, estado y otros campos de un perfil.
 */
export async function actualizarUsuario(id: string, valores: Partial<Usuario>): Promise<void> {
  try {
    const payload: Record<string, unknown> = {
      actualizado_en: new Date().toISOString(),
    };

    if (valores.nombre) payload.nombre = valores.nombre;
    if (valores.rol) payload.rol = valores.rol;
    if (valores.ciudad) payload.ciudad = valores.ciudad;
    if (valores.estado) payload.estado = valores.estado;

    const { error } = await supabase
      .from("perfiles")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar el usuario";
    console.error("[Usuarios Service] Error actualizando usuario:", err);
    throw new Error(msg);
  }
}

/**
 * Desactiva un usuario (soft-delete) en lugar de borrarlo,
 * ya que no podemos borrarlo de auth.users sin permisos de Service Role.
 */
export async function desactivarUsuario(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("perfiles")
      .update({ estado: "Inactivo", actualizado_en: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al desactivar el usuario";
    console.error("[Usuarios Service] Error desactivando usuario:", err);
    throw new Error(msg);
  }
}
