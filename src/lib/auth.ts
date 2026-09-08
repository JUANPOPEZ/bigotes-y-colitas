import { useState, useEffect } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import type { Rol } from "@/types";

export type PerfilRow = Database["public"]["Tables"]["perfiles"]["Row"];

export interface AuthState {
  user: User | null;
  session: Session | null;
  perfil: PerfilRow | null;
  rol: Rol;
  autenticado: boolean;
  cargando: boolean;
}

let estadoGlobal: AuthState = {
  user: null,
  session: null,
  perfil: null,
  rol: "visitante",
  autenticado: false,
  cargando: true,
};

const listeners = new Set<(estado: AuthState) => void>();

function emitir() {
  listeners.forEach((l) => l(estadoGlobal));
}

export async function obtenerPerfil(userId: string): Promise<PerfilRow | null> {
  try {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[Auth] No se pudo obtener perfil:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[Auth] Error consultando perfil:", err);
    return null;
  }
}

async function sincronizarSesion(session: Session | null) {
  if (!session?.user) {
    estadoGlobal = {
      user: null,
      session: null,
      perfil: null,
      rol: "visitante",
      autenticado: false,
      cargando: false,
    };
    emitir();
    return;
  }

  const user = session.user;
  const perfil = await obtenerPerfil(user.id);
  const rol: Rol =
    perfil?.rol === "administrador"
      ? "administrador"
      : perfil?.rol === "adoptante"
        ? "adoptante"
        : (user.user_metadata?.rol as Rol) || "adoptante";

  estadoGlobal = {
    user,
    session,
    perfil,
    rol,
    autenticado: true,
    cargando: false,
  };
  emitir();
}

// Inicialización de listener de sesión en Supabase
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data: { session } }) => {
    sincronizarSesion(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    sincronizarSesion(session);
  });
}

export function useAuth(): AuthState {
  const [estado, setEstado] = useState<AuthState>(estadoGlobal);

  useEffect(() => {
    listeners.add(setEstado);
    setEstado(estadoGlobal);
    return () => {
      listeners.delete(setEstado);
    };
  }, []);

  return estado;
}

export async function iniciarSesion(
  email: string,
  password: string,
): Promise<{
  user: User;
  session: Session;
  perfil: PerfilRow | null;
  rol: Rol;
}> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message || "No se pudo iniciar sesión con las credenciales ingresadas.");
  }

  const perfil = await obtenerPerfil(data.user.id);
  const rol: Rol =
    perfil?.rol === "administrador"
      ? "administrador"
      : perfil?.rol === "adoptante"
        ? "adoptante"
        : (data.user.user_metadata?.rol as Rol) || "adoptante";

  estadoGlobal = {
    user: data.user,
    session: data.session,
    perfil,
    rol,
    autenticado: true,
    cargando: false,
  };
  emitir();

  return {
    user: data.user,
    session: data.session,
    perfil,
    rol,
  };
}

export async function registrarUsuario(params: {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  ciudad?: string;
  rol?: "adoptante" | "administrador";
}) {
  const { email, password, nombre, telefono, ciudad, rol = "adoptante" } = params;

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        nombre: nombre.trim(),
        full_name: nombre.trim(),
        telefono,
        ciudad: ciudad || "Bogotá",
        rol,
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "No se pudo registrar el usuario en Supabase.");
  }

  if (data.session) {
    await sincronizarSesion(data.session);
  }

  return data;
}

export async function cerrarSesion(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("[Auth] Error cerrando sesión en Supabase:", err);
  }
  estadoGlobal = {
    user: null,
    session: null,
    perfil: null,
    rol: "visitante",
    autenticado: false,
    cargando: false,
  };
  emitir();
}

/**
 * Inicia el flujo de autenticación con Google OAuth usando la instancia oficial de Supabase.
 */
export async function iniciarSesionConGoogle(): Promise<void> {
  const redirectUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "https://bigotes-y-colitas.vercel.app/auth/callback";

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw new Error(error.message || "Error al iniciar sesión con Google.");
  }
}

/**
 * Permite acceder en modo de exploración / demo sin bloquear la UI ni depender de red.
 * Notifica a useAuth() reactivamente para reflejar el rol correspondiente.
 */
export function ingresarComoDemo(rol: "adoptante" | "administrador"): void {
  const userDemo: User = {
    id: rol === "administrador" ? "demo-admin-id" : "demo-adoptante-id",
    app_metadata: {},
    user_metadata: {
      nombre: rol === "administrador" ? "Administrador Demo" : "María Fernanda López",
      rol,
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: rol === "administrador" ? "admin@bigotesycolitas.org" : "maria.lopez@correo.com",
    phone: "3001234567",
    role: "authenticated",
    updated_at: new Date().toISOString(),
  };

  const perfilDemo: PerfilRow = {
    id: userDemo.id,
    nombre: rol === "administrador" ? "Administrador Demo" : "María Fernanda López",
    correo: userDemo.email!,
    rol,
    ciudad: "Bogotá",
    telefono: "3001234567",
    avatar_url: null,
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  };

  estadoGlobal = {
    user: userDemo,
    session: null,
    perfil: perfilDemo,
    rol,
    autenticado: true,
    cargando: false,
  };
  emitir();
}

