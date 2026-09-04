import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Defínelas en .env (local) y en Vercel → Settings → Environment Variables (con prefijo VITE_), luego vuelve a desplegar.",
  );
}

export const supabase = createClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
