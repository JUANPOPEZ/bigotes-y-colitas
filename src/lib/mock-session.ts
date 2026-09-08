import type { Rol } from "@/types";
import { useAuth, ingresarComoDemo, cerrarSesion } from "@/lib/auth";

/**
 * Módulo de compatibilidad hacia atrás.
 * Delega directamente al contexto de autenticación en @/lib/auth.
 */

const CLAVE = "byc:rol";

// Limpiar cualquier residuo de roles simulados en navegadores anteriores
if (typeof window !== "undefined") {
  window.localStorage.removeItem(CLAVE);
}

export function setRolSimulado(nuevo: Rol) {
  if (nuevo === "administrador" || nuevo === "adoptante") {
    ingresarComoDemo(nuevo);
  } else {
    cerrarSesion();
  }
}

export function cerrarSesionSimulada() {
  cerrarSesion();
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
