import { createClient, supabaseAdmin } from "@/lib/supabase/server";

export class AdminAuthError extends Error {
  constructor(message: string, public status = 401) {
    super(message);
  }
}

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AdminAuthError("Unauthorized", 401);
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new AdminAuthError("Forbidden", 403);
  }

  return user;
}
