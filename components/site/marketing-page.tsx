"use client";

import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  Copy,
  GraduationCap,
  Laptop,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import {useMemo, useState} from "react";
import {PromptCard} from "@/components/prompt-card";
import {Footer} from "@/components/site/footer";
import {SiteNav} from "@/components/site/nav";
import {AccordionGroup} from "@/components/ui/accordion";
import {ButtonLink} from "@/components/ui/button-link";
import {PromptText} from "@/components/ui/prompt-text";
import {Reveal} from "@/components/ui/reveal";
import {useCopyFeedback} from "@/hooks/use-copy-feedback";
import {hasPremiumAccess} from "@/lib/access";
import {
  audienceSegments,
  categories,
  customizationGuide,
  faqs,
  pricingPlans,
} from "@/lib/data";
import type {AuthUserView, PromptCategory, PromptItem} from "@/lib/types";

const icons = {
  GraduationCap,
  BookOpen,
  BriefcaseBusiness,
  Smartphone,
  Laptop,
};

const heroPrompt =
  "Write an academic reflection essay about [MAKABAYANG_TOPIC] suitable for [GRADE_LEVEL]. Blend formal local insights with relatable Taglish context. Highlight personal growth areas and Filipino civic values.";

export function MarketingPage({items, user}: {items: PromptItem[]; user: AuthUserView | null}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | PromptCategory>("All");
  const {copiedKey, copy} = useCopyFeedback();
  const premiumAccess = hasPremiumAccess(user?.profile ?? null, user?.subscription ?? null);

  const filteredPrompts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const searchable = [item.title, item.purpose, item.prompt, item.bestFor, ...(item.tags ?? [])].join(" ").toLowerCase();
      return matchesCategory && (!search || searchable.includes(search));
    });
  }, [category, items, query]);
  const freeCount = items.filter((item) => item.access === "Free").length;
  const categoryCount = new Set(items.map((item) => item.category)).size;

  function chooseCategory(nextCategory: PromptCategory) {
    setCategory(nextCategory);
    document.getElementById("library-browser")?.scrollIntoView({behavior: "smooth", block: "start"});
  }

  function searchTag(tag: string) {
    setQuery(tag);
    document.getElementById("library-browser")?.scrollIntoView({behavior: "smooth", block: "start"});
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bgbase text-textprimary">
      <div className="mesh-gradient" />
      <div className="grain-overlay" />
      <SiteNav />

      <main className="relative z-10">
        <header className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-12">
          <div className="flex flex-col space-y-8 lg:col-span-7">
            <div className="inline-flex self-start rounded-full border border-gold/20 bg-gold/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-gold">
              Proudly made for Filipino careers and businesses
            </div>
            <div className="space-y-5">
              <h1 className="font-serif text-5xl leading-[1.12] tracking-normal text-textprimary md:text-6xl lg:text-[72px]">
                The AI Prompt Library <br />
                <span className="bg-gradient-to-r from-gold via-amber to-gold bg-clip-text text-transparent">
                  Built for Real Work.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-textsecondary">
                Stop writing bad prompts. <span className="font-medium text-textprimary">PromptVault PH</span> gives you ready-to-copy,
                expert-crafted prompts for school, business, teaching, content creation, and freelancing.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="#featured">Browse Free Prompts</ButtonLink>
              <ButtonLink href="#pricing" variant="secondary">
                See Pricing & Plans
              </ButtonLink>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border/80 pt-8 font-mono text-xs uppercase tracking-[0.08em] text-textsecondary md:grid-cols-4">
              {[
                [String(items.length), "Launch Prompts"],
                [String(freeCount), "Free Prompts"],
                [String(categoryCount), "Categories"],
                ["PH-Ready", "Local Workflows"],
              ].map(([value, label]) => (
                <div className="flex flex-col gap-1" key={label}>
                  <span className="font-serif text-lg font-bold text-gold">{value}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="absolute -inset-1.5 rounded-lg bg-gradient-to-r from-gold/20 to-amber/20 opacity-70 blur-xl" />
            <div className="relative flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-textsecondary">Live Prompt Preview</span>
                <div className="h-2 w-2 rounded-full bg-teal" />
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-serif text-lg font-bold text-textprimary">Taglish Reflection Essay</h3>
                <span className="rounded-full border border-teal/20 bg-teal/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-teal">
                  Free
                </span>
              </div>
              <p className="text-xs text-textsecondary">Generates academic reflection papers in Taglish or formal English.</p>
              <div className="rounded-r-md border-l-2 border-gold bg-elevated p-4 font-mono text-[11px] leading-relaxed text-textsecondary">
                <span className="mb-2 block text-[9px] uppercase tracking-[0.12em] text-textmuted">
                  {`// prompt body preview`}
                </span>
                <PromptText text={heroPrompt} />
              </div>
              <button
                className={`inline-flex w-full items-center justify-center gap-2 rounded border py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  copiedKey === "hero"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border bg-white/5 text-textprimary hover:border-gold hover:bg-elevated hover:text-gold"
                }`}
                onClick={() => copy("hero", heroPrompt)}
                type="button"
              >
                {copiedKey === "hero" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedKey === "hero" ? "Copied" : "Copy Sample Prompt"}
              </button>
            </div>
          </div>
        </header>

        <Reveal className="mx-auto max-w-7xl border-t border-border/50 px-6 py-20" >
          <section id="how-it-works">
            <SectionHeading kicker="Simplified Prompting Process" title="Stop guessing. Copy and win." />
            <div className="relative grid gap-12 text-center md:grid-cols-3 md:text-left">
              <div className="absolute left-[16%] right-[16%] top-10 z-0 hidden h-px bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10 md:block" />
              {[
                ["01", "Pick Your Category", "Choose from Students, Teachers, Business, Social Media, or Freelancing guides matching your tasks."],
                ["02", "Find Your Prompt", "Search or filter down to local workflows like GCash promos or full monthly content calendars."],
                ["03", "Copy and Use Any AI Tool", "Swap the gold bracket variables and paste directly into ChatGPT, Gemini, or Claude."],
              ].map(([number, title, body]) => (
                <div className="relative z-10 flex flex-col items-center gap-4 md:items-start" key={number}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-elevated font-serif text-2xl font-bold text-gold shadow-lg shadow-gold/5">
                    {number}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-textprimary">{title}</h3>
                  <p className="text-sm leading-relaxed text-textsecondary">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-7xl border-t border-border/50 px-6 py-20">
          <section id="who-it-is-for">
            <SectionHeading kicker="Designed for Every Filipino Role" title="Who leverages PromptVault?" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {audienceSegments.map((segment) => {
                const Icon = icons[segment.icon as keyof typeof icons];
                return (
                  <button
                    className="vault-card group flex min-h-[280px] flex-col justify-between p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    key={segment.name}
                    onClick={() => chooseCategory(segment.name)}
                    type="button"
                  >
                    <div className="space-y-4">
                      <Icon className="h-8 w-8 text-gold transition group-hover:scale-110" />
                      <h3 className="font-serif text-xl font-bold text-textprimary">{segment.name}</h3>
                      <p className="text-xs leading-relaxed text-textsecondary">{segment.description}</p>
                      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3 font-mono text-[11px] text-textsecondary">
                        {segment.examples.map((example) => (
                          <span key={example}>- {example}</span>
                        ))}
                      </div>
                    </div>
                    <span className="mt-6 text-xs font-bold text-gold">Browse Prompts -&gt;</span>
                  </button>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-7xl border-t border-border/50 px-6 py-20">
          <section id="featured">
            <SectionHeading
              kicker="Live Interactive Library"
              title="Try These Free Prompts Right Now"
              body="Tested prompts on actual AI tools. Tap copy and start working immediately."
            />
            <div className="grid gap-8 lg:grid-cols-2">
              {items.slice(0, 6).map((item) => (
                <PromptCard item={item} key={item.id} locked={item.access === "Premium" && !premiumAccess} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link className="text-sm font-bold uppercase tracking-[0.08em] text-gold transition hover:text-gold/80" href="#library-browser">
                See All {items.length} Launch Prompts -&gt;
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-7xl border-t border-border/50 px-6 pt-20">
          <section id="library-browser">
            <SectionHeading kicker="Comprehensive Vault Lookup" title="Access the Entire Prompt Vault" />
            <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-textsecondary" aria-hidden="true" />
                <input
                  className="w-full rounded-lg border border-border bg-bgbase py-4 pl-12 pr-28 text-sm text-textprimary transition placeholder:text-textmuted focus:border-gold/60 focus:outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search prompts... essay, lesson plan, Facebook caption, Upwork proposal"
                  type="search"
                  value={query}
                />
                <button
                  className="absolute right-2 rounded bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-bgbase transition hover:bg-gold/90"
                  onClick={() => document.getElementById("library-grid")?.scrollIntoView({behavior: "smooth"})}
                  type="button"
                >
                  Search
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-textmuted">Popular:</span>
                {["Essay", "Lesson Plan", "Facebook Caption", "Research Title", "Upwork", "GCash", "Quiz"].map((tag) => (
                  <button
                    className="rounded-full border border-border/60 bg-elevated px-3 py-1 font-mono text-xs font-medium text-textsecondary transition hover:text-gold"
                    key={tag}
                    onClick={() => searchTag(tag)}
                    type="button"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <section className="mx-auto max-w-7xl px-6 py-12" id="library-grid">
          <div className="mx-auto mb-8 flex h-[55px] max-w-5xl items-center gap-2 overflow-x-auto border-b border-border/60 pb-4">
            {categories.map((item) => (
              <button
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                  category === item
                    ? "bg-gold text-bgbase"
                    : "border border-transparent text-textsecondary hover:border-border hover:bg-elevated/60 hover:text-textprimary"
                }`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item === "All" ? "All Prompts" : item}
              </button>
            ))}
          </div>
          {filteredPrompts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrompts.map((item) => (
                <PromptCard compact item={item} key={item.id} locked={item.access === "Premium" && !premiumAccess} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-textsecondary">
              <p className="font-mono text-xs">
                No prompts found matching &quot;{query}&quot; in &quot;{category}&quot;.
              </p>
              <button className="mt-3 text-xs text-gold underline" onClick={() => { setQuery(""); setCategory("All"); }} type="button">
                Clear filters
              </button>
            </div>
          )}
        </section>

        <Reveal className="mx-auto max-w-7xl border-t border-border/50 px-6 py-20">
          <section id="pricing">
            <SectionHeading
              kicker="Straightforward Premium Access"
              title="Simple, Affordable Pricing"
              body="Start free, then join the single Founding plan through Xendit's hosted checkout when you need premium access."
            />
            <div className="mx-auto grid max-w-4xl items-stretch gap-8 lg:grid-cols-2">
              {pricingPlans.map((plan) => (
                <div
                  className={`relative flex flex-col justify-between rounded-lg p-8 ${
                    plan.highlighted
                      ? "z-10 scale-[1.01] border-2 border-gold bg-surface shadow-2xl lg:scale-[1.04]"
                      : "vault-card border border-border"
                  }`}
                  key={plan.name}
                >
                  {plan.highlighted ? (
                    <div className="absolute -top-4 right-6 rounded-full bg-gold px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-bgbase">
                      Founding Pilot Promo
                    </div>
                  ) : null}
                  <div className="space-y-6">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">{plan.label}</span>
                    <div>
                      <span className="font-serif text-4xl font-black text-textprimary">{plan.priceLabel}</span>
                      <span className="ml-2 font-mono text-xs text-textsecondary">/ {plan.cadence}</span>
                    </div>
                    <p className="text-sm text-textsecondary">{plan.description}</p>
                    <ul className="flex flex-col gap-4 border-t border-border/60 pt-6 text-sm text-textsecondary">
                      {plan.features.map((feature) => (
                        <li className="flex items-center gap-3" key={feature}>
                          <Check className="h-4 w-4 text-gold" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.unavailable?.map((feature) => (
                        <li className="flex items-center gap-3 opacity-45" key={feature}>
                          <ShieldCheck className="h-4 w-4 text-textmuted" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ButtonLink className="mt-8 w-full" href={plan.name === "Free" ? "/signup" : "/billing"} variant={plan.highlighted ? "primary" : "ghost"}>
                    {plan.ctaLabel}
                  </ButtonLink>
                </div>
              ))}
            </div>
            <div className="mt-12 space-y-2 text-center text-xs text-textsecondary">
              <p>Paid checkout is handled by Xendit. Available payment methods depend on approved recurring channels.</p>
              <p>Access begins only after verified payment confirmation. Cancel anytime; paid access remains through the current period.</p>
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-5xl border-t border-border/50 px-6 py-20">
          <section id="customization">
            <SectionHeading
              kicker="Replacement Rules"
              title="How to Customize a Prompt"
              body="Every prompt uses [BRACKETS] as placeholders. Replace them with concrete details for stronger results."
            />
            <AccordionGroup items={customizationGuide} itemTitleClassName="font-mono text-sm font-bold text-gold" />
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-5xl border-t border-border/50 px-6 py-20">
          <SectionHeading
            kicker="Truthful Launch Inventory"
            title={`${items.length} prompts, available today`}
            body={`${freeCount} prompts are free to copy. Premium prompt bodies stay server-locked unless a signed-in member has current paid access.`}
          />
        </Reveal>

        <Reveal className="mx-auto max-w-4xl border-t border-border/50 px-6 py-20">
          <section id="faq">
            <SectionHeading kicker="Curious About Vaulting" title="Frequently Asked Questions" />
            <AccordionGroup items={faqs} />
          </section>
        </Reveal>

        <section className="relative z-10 mx-auto mb-20 max-w-6xl overflow-hidden rounded-lg border border-gold/15 bg-gradient-to-r from-surface to-elevated px-6 py-16 text-center shadow-2xl">
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">Verified Activation</p>
            <h2 className="font-serif text-3xl leading-tight text-textprimary md:text-5xl">Start Prompting Smarter Today</h2>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-textsecondary">
              Browse the live launch catalog for school, teaching, freelancing, content, and small-business workflows.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <ButtonLink href="#featured">Browse Free Prompts</ButtonLink>
              <ButtonLink href="#pricing" variant="ghost">
                See Pricing
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionHeading({kicker, title, body}: {kicker: string; title: string; body?: string}) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-gold">{kicker}</p>
      <h2 className="font-serif text-3xl tracking-normal text-textprimary md:text-5xl">{title}</h2>
      {body ? <p className="mt-3 text-sm leading-relaxed text-textsecondary">{body}</p> : null}
    </div>
  );
}
