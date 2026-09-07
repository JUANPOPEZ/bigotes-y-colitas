import { useSyncExternalStore } from "react";
import type { Rol } from "@/types";
import { useAuth } from "@/lib/auth";

/**
 * Sesión de usuario para la interfaz.
 * Si el usuario inicia sesión real con Supabase Auth, se usa su perfil y rol real.
 * Si no, permite simular rol en localStorage para explorar vistas.
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
  const auth = useAuth();
  const actualMock = useSyncExternalStore(
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

  if (auth.autenticado) {
    return {
      rol: auth.rol,
      setRol: setRolSimulado,
      autenticado: true,
      perfil: auth.perfil,
      user: auth.user,
    };
  }

  return {
    rol: actualMock,
    setRol: setRolSimulado,
    autenticado: actualMock !== "visitante",
    perfil: null,
    user: null,
  };
}

export const usuarioDemo = {
  nombre: "María Fernanda López",
  correo: "maria.lopez@correo.com",
  iniciales: "MF",
};
