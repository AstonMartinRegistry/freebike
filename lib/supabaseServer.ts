import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string | undefined;

if (!SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL env var");
}

if (!SUPABASE_SERVICE_ROLE) {
  // We intentionally throw to ensure server routes can enforce rules without RLS tuning
  throw new Error("Missing SUPABASE_SERVICE_ROLE env var (server only)");
}

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});


