import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the Service Role key.
 * WARNING: Only use this on trusted server-side code (Edge/Server functions).
 */
export function createAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
