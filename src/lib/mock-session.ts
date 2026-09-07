import type { Rol } from "@/types";
import { useAuth } from "@/lib/auth";

/**
 * Módulo de compatibilidad hacia atrás.
 * Delega directamente al contexto real de Supabase Auth en @/lib/auth.
 */

const CLAVE = "byc:rol";

// Limpiar cualquier residuo de roles simulados en navegadores anteriores
if (typeof window !== "undefined") {
  window.localStorage.removeItem(CLAVE);
}

export function setRolSimulado(_nuevo: Rol) {
  // Obsoleto: La aplicación ahora utiliza autenticación estricta con Supabase Auth.
}

export function cerrarSesionSimulada() {
  // Obsoleto: Delegado a supabase.auth.signOut()
}

export function useRolSimulado() {
  const auth = useAuth();

  return {
    rol: auth.rol,
    setRol: setRolSimulado,
    autenticado: auth.autenticado,
    perfil: auth.perfil,
    user: auth.user,
    cargando: auth.cargando,
  };
}

export const usuarioDemo = {
  nombre: "María Fernanda López",
  correo: "maria.lopez@correo.com",
  iniciales: "MF",
};
