import Link from "next/link";
import {Suspense} from "react";
import {AuthForm} from "@/components/app/auth-form";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bgbase px-6 py-10 text-textprimary">
      <div className="mesh-gradient" />
      <section className="relative z-10 mx-auto max-w-md rounded-lg border border-border bg-surface p-8 shadow-2xl">
        <Link className="font-serif text-2xl font-bold" href="/">
          Prompt<span className="text-gold">V</span>ault <span className="text-gold">PH</span>
        </Link>
        <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">Member Access</p>
        <h1 className="mt-2 font-serif text-4xl text-textprimary">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-textsecondary">
          Enter your account credentials to open your prompt dashboard and billing workspace.
        </p>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
        <p className="mt-6 text-sm text-textsecondary">
          New to PromptVault?{" "}
          <Link className="text-gold hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
