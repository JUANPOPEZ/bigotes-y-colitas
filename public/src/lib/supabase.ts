import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Credenciales públicas oficiales de Supabase para Bigotes y Colitas.
 * En Supabase, la URL y la clave anon (publishable) son públicas y seguras
 * para incluirse en el frontend (la seguridad la gestiona RLS en Postgres).
 */
const DEFAULT_SUPABASE_URL = "https://hiaskeppprosyxxcdjap.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_1bd9-I9Rwi87Iy75JPW08w_0yl0FJ1-";

const supabaseUrl = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL
).trim();

const supabaseAnonKey = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY
).trim();

export const supabase = createClient<Database>(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
