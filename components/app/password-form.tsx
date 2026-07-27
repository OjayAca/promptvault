"use client";

import {useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {createBrowserSupabase} from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const supabase = createBrowserSupabase();
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    setMessage(error ? error.message : "If the account exists, a reset link has been sent.");
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm text-textsecondary">
        Email
        <input className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary" name="email" required type="email" />
      </label>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <button className="rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase text-bgbase" disabled={loading} type="submit">
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    const {error} = await supabase.auth.updateUser({password});
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm text-textsecondary">
        New password
        <input className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary" minLength={8} name="password" required type="password" />
      </label>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <button className="rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase text-bgbase" disabled={loading} type="submit">
        {loading ? "Saving..." : "Update Password"}
      </button>
    </form>
  );
}
