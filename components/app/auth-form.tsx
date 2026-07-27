"use client";

import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {useState, type FormEvent} from "react";
import {createBrowserSupabase} from "@/lib/supabase/browser";
import {safeNextPath} from "@/lib/http";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({mode}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();

    if (!email || password.length < 8) {
      setError("Enter an email and a password with at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabase();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({email, password})
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {full_name: fullName},
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
              },
            });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (mode === "signup" && !result.data.session) {
        setNotice("Check your email to verify your account, then sign in.");
        return;
      }

      router.replace(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={submit}>
      {mode === "signup" ? (
        <label className="grid gap-2 text-sm text-textsecondary">
          Full name
          <input
            className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary outline-none transition focus:border-gold"
            name="fullName"
            placeholder="Juan Dela Cruz"
            maxLength={120}
            required
            type="text"
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm text-textsecondary">
        Email
        <input
          autoComplete="email"
          className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary outline-none transition focus:border-gold"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm text-textsecondary">
        Password
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary outline-none transition focus:border-gold"
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
      </label>
      {error ? <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
      {notice ? <p className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">{notice}</p> : null}
      <button
        className="rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-bgbase transition hover:bg-gold/90 disabled:cursor-wait disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
      {mode === "login" ? (
        <Link className="text-center text-sm text-gold hover:underline" href="/forgot-password">
          Forgot your password?
        </Link>
      ) : null}
    </form>
  );
}
