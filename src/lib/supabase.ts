import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ejemplo-proyecto.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "ejemplo-anon-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase] Las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas en .env. Usando cliente en modo desarrollo.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
