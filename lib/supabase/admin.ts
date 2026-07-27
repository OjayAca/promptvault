import {createClient} from "@supabase/supabase-js";
import {getSupabaseServiceConfig} from "@/lib/env";

export function createSupabaseAdmin() {
  const config = getSupabaseServiceConfig();

  if (!config) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
