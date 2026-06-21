import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// ─── Browser / Client Component client ────────────────────────────
// Uses the anon key — respects Row Level Security
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Server-only client ────────────────────────────────────────────
// Uses the service role key — bypasses RLS
// Only import this in Server Components or API routes, never in client components
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);