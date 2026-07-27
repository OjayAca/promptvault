"use client";

import {LogOut} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {createBrowserSupabase} from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-textsecondary transition hover:border-gold hover:text-gold disabled:opacity-60"
      disabled={loading}
      onClick={signOut}
      type="button"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}
