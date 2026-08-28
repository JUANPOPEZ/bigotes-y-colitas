import { useSyncExternalStore } from "react";
import type { Rol } from "@/types";

/**
 * Sesión SIMULADA únicamente para navegar la interfaz.
 * No hay autenticación real: al conectar el backend, sustituir este store
 * por el contexto de sesión JWT. Se persiste en localStorage para que la
 * cabecera muestre el perfil aunque se recargue la página.
 */

const CLAVE = "byc:rol";
const ROLES: Rol[] = ["visitante", "adoptante", "administrador"];

let rol: Rol = "visitante";
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  const guardado = window.localStorage.getItem(CLAVE) as Rol | null;
  if (guardado && ROLES.includes(guardado) && guardado !== rol) {
    rol = guardado;
    emit();
  }
}

export function setRolSimulado(nuevo: Rol) {
  rol = nuevo;
  hidratado = true;
  if (typeof window !== "undefined") {
    if (nuevo === "visitante") window.localStorage.removeItem(CLAVE);
    else window.localStorage.setItem(CLAVE, nuevo);
  }
  emit();
}

export function cerrarSesionSimulada() {
  setRolSimulado("visitante");
}

export function useRolSimulado() {
  const actual = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      hidratar();
      const sincronizar = (e: StorageEvent) => {
        if (e.key === CLAVE) {
          rol = (e.newValue as Rol | null) ?? "visitante";
          emit();
        }
      };
      window.addEventListener("storage", sincronizar);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", sincronizar);
      };
    },
    () => rol,
    () => "visitante" as Rol,
  );
  return { rol: actual, setRol: setRolSimulado, autenticado: actual !== "visitante" };
}

export const usuarioDemo = {
  nombre: "María Fernanda López",
  correo: "maria.lopez@correo.com",
  iniciales: "MF",
};
