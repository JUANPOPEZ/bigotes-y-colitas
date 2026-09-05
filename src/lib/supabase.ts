import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Vite inyecta VITE_* en el cliente en el build (`import.meta.env`).
 * En el SSR de Vercel (/var/task/_ssr) esas claves suelen venir vacías:
 * hay que leer también `process.env`, que Vercel sí rellena en runtime.
 */
function leerEnv(nombre: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const desdeVite = import.meta.env[nombre];
  const desdeRuntime =
    typeof process !== "undefined" && process.env ? process.env[nombre] : undefined;
  const valor = (typeof desdeVite === "string" && desdeVite) || desdeRuntime || "";
  return valor.trim();
}

const supabaseUrl = leerEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = leerEnv("VITE_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Defínelas en .env (local) y en Vercel → Settings → Environment Variables, luego vuelve a desplegar.",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
