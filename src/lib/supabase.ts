import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/config";

export function createSupabaseAdminClient() {
  const { supabaseServiceRoleKey, supabaseUrl } = getSupabaseConfig();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
