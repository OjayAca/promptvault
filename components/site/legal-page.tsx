import Link from "next/link";
import type {ReactNode} from "react";

export function LegalPage({title, summary, children}: {title: string; summary: string; children: ReactNode}) {
  return (
    <main className="min-h-screen bg-bgbase px-6 py-12 text-textprimary">
      <article className="mx-auto max-w-3xl">
        <Link className="text-sm text-textsecondary transition hover:text-gold" href="/">
          Back to PromptVault
        </Link>
        <header className="mt-10 border-b border-border pb-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">PromptVault PH</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-textsecondary">{summary}</p>
          <p className="mt-3 text-xs text-textmuted">Effective July 27, 2026</p>
        </header>
        <div className="legal-copy mt-10 grid gap-8 text-sm leading-7 text-textsecondary">{children}</div>
      </article>
    </main>
  );
}

export function LegalSection({title, children}: {title: string; children: ReactNode}) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-textprimary">{title}</h2>
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  );
}
