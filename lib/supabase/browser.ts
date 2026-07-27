"use client";

import {createBrowserClient} from "@supabase/ssr";
import {getSupabaseConfig} from "@/lib/env";

export function createBrowserSupabase() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createBrowserClient(config.url, config.anonKey);
}
