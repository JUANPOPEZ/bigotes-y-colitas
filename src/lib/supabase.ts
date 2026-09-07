import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * En Vite (cliente), las variables deben llamarse de forma estática y explícita
 * (`import.meta.env.VITE_*`) para que el compilador las sustituya en el bundle.
 * En SSR (servidor en Vercel), se toma de `process.env.VITE_*` en runtime.
 */
const supabaseUrl = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_URL) ||
  ""
).trim();

const supabaseAnonKey = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  ""
).trim();

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
