"use client";

import {BarChart3, BookMarked, CreditCard, LayoutDashboard, Lock, Search, Settings, Shield} from "lucide-react";
import Link from "next/link";
import {useMemo, useState} from "react";
import {PromptRequestForm} from "@/components/app/prompt-request-form";
import {SignOutButton} from "@/components/app/sign-out-button";
import {PromptCard} from "@/components/prompt-card";
import {categories} from "@/lib/data";
import {hasPremiumAccess} from "@/lib/access";
import type {AuthUserView, PromptCategory, PromptItem} from "@/lib/types";
import type {LucideIcon} from "lucide-react";

const baseNav: Array<[string, string, LucideIcon]> = [
  ["Dashboard", "/app", LayoutDashboard],
  ["Library", "/app", BookMarked],
  ["Billing", "/billing", CreditCard],
  ["Account", "/account", Settings],
];

export function AppShell({items, user}: {items: PromptItem[]; user: AuthUserView | null}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | PromptCategory>("All");
  const [showPremium, setShowPremium] = useState(true);
  const premiumAccess = hasPremiumAccess(user?.profile ?? null, user?.subscription ?? null);
  const premiumCount = items.filter((item) => item.access === "Premium").length;
  const nav = user?.profile?.role === "admin" ? [...baseNav, ["Admin", "/admin", Shield] as [string, string, LucideIcon]] : baseNav;

  const visiblePrompts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesPremium = showPremium || item.access === "Free";
      const searchable = [item.title, item.purpose, item.prompt, item.bestFor, ...(item.tags ?? [])].join(" ").toLowerCase();
      return matchesCategory && matchesPremium && (!search || searchable.includes(search));
    });
  }, [category, items, query, showPremium]);

  return (
    <div className="min-h-screen bg-bgbase text-textprimary">
      <div className="mesh-gradient" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-border bg-surface/80 p-5 backdrop-blur lg:border-b-0 lg:border-r">
          <Link className="font-serif text-2xl font-bold" href="/">
            Prompt<span className="text-gold">V</span>ault <span className="text-gold">PH</span>
          </Link>
          <div className="mt-6 rounded-lg border border-gold/20 bg-gold/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">Member Account</p>
            <p className="mt-2 text-xs leading-relaxed text-textsecondary">
              {user ? `Signed in as ${user.email ?? "member"}` : "Supabase is not configured; showing seed catalog."}
            </p>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
            {nav.map(([label, href, Icon]) => (
              <Link
                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-textsecondary transition hover:bg-elevated hover:text-gold"
                href={href}
                key={label}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
            {user ? <SignOutButton /> : null}
          </nav>
        </aside>

        <main className="p-5 md:p-8">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 xl:flex-row xl:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">Member Workspace</p>
              <h1 className="mt-2 font-serif text-4xl text-textprimary md:text-5xl">Prompt Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textsecondary">
                Search the live prompt catalog, copy available prompts, and manage premium access through your subscription.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                [String(items.length), "Prompts"],
                [String(premiumCount), "Premium"],
                [String(categories.length - 1), "Tracks"],
              ].map(([value, label]) => (
                <div className="rounded-lg border border-border bg-surface px-4 py-3" key={label}>
                  <div className="font-serif text-2xl font-bold text-gold">{value}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-textmuted">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <section className="grid gap-5 py-8 xl:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textsecondary" aria-hidden="true" />
                <input
                  className="w-full rounded-lg border border-border bg-bgbase py-4 pl-12 pr-4 text-sm text-textprimary placeholder:text-textmuted focus:border-gold/60 focus:outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, purpose, prompt text, or use case"
                  type="search"
                  value={query}
                />
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {categories.map((item) => (
                  <button
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                      category === item
                        ? "bg-gold text-bgbase"
                        : "border border-border text-textsecondary hover:text-gold"
                    }`}
                    key={item}
                    onClick={() => setCategory(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-gold" />
                <div>
                  <h2 className="text-sm font-bold text-textprimary">Access Preview</h2>
                  <p className="text-xs text-textsecondary">
                    {premiumAccess ? "Your plan can copy premium prompts." : "Premium cards stay locked until checkout is active."}
                  </p>
                </div>
              </div>
              <label className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-border bg-bgbase p-3 text-sm text-textsecondary">
                Include premium
                <input checked={showPremium} onChange={(event) => setShowPremium(event.target.checked)} type="checkbox" />
              </label>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visiblePrompts.map((item) => (
              <PromptCard compact item={item} key={item.id} locked={item.access === "Premium" && !premiumAccess} />
            ))}
          </section>

          {visiblePrompts.length === 0 ? (
            <section className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-textsecondary">
              No prompts match your filters.
            </section>
          ) : null}

          <section className="mt-10 rounded-lg border border-gold/20 bg-gold/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">
                  <Lock className="h-4 w-4" /> Subscription Status
                </p>
                <h2 className="mt-2 font-serif text-2xl text-textprimary">
                  {user?.subscription?.plan ?? "Free"} - {user?.subscription?.status ?? "seed preview"}
                </h2>
                <p className="mt-2 text-sm text-textsecondary">
                  Join the Founding plan to unlock every premium prompt card and request catalog additions.
                </p>
              </div>
              <Link className="rounded-lg bg-gold px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-bgbase" href="/billing">
                Manage Billing
              </Link>
            </div>
          </section>

          {premiumAccess ? (
            <section className="mt-8">
              <PromptRequestForm />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
