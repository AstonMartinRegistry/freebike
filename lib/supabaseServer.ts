import { createClient } from "@supabase/supabase-js";

// Support common naming patterns for Supabase env vars
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

// Prefer service role on the server; fall back to anon keys if provided
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseKey) missing.push("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  throw new Error(
    `Supabase environment not configured. Missing: ${missing.join(", ")}.\n` +
      `Add them to a .env.local file in the project root and restart the dev server.`
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});


