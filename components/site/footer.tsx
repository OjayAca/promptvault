import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-surface/80 pb-8 pt-16">
      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <Link className="font-serif text-xl font-black text-textprimary" href="/">
            Prompt<span className="text-gold">V</span>ault <span className="text-gold">PH</span>
          </Link>
          <p className="text-xs leading-relaxed text-textsecondary">
            Ready-to-copy AI prompt lists tailored for school, business, freelancing, and digital content creation in the Philippines.
          </p>
          <span className="block font-mono text-[10px] text-textsecondary">{`// Built in Manila, PH`}</span>
        </div>
        <FooterColumn
          title="Library Packs"
          links={[
            ["All Prompts", "/#library-browser"],
            ["Students Track", "/#library-browser"],
            ["Teachers Track", "/#library-browser"],
            ["Business Templates", "/#library-browser"],
            ["Social Content", "/#library-browser"],
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ["Dashboard", "/app"],
            ["Pricing", "/#pricing"],
            ["Account", "/account"],
            ["Billing", "/billing"],
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            ["How It Works", "/#how-it-works"],
            ["Bracket Replacement", "/#customization"],
            ["FAQ Help", "/#faq"],
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["Cancellation & Refunds", "/cancellation-refunds"],
            ["Contact Support", "/support"],
          ]}
        />
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/40 px-6 pt-6 text-[11px] text-textmuted sm:flex-row">
        <span>Copyright 2026 PromptVault PH. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link className="text-textsecondary transition hover:text-gold" href="/privacy">Privacy</Link>
          <Link className="text-textsecondary transition hover:text-gold" href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({title, links}: {title: string; links: string[][]}) {
  return (
    <div className="space-y-3">
      <h4 className="border-l-2 border-gold pl-2 text-xs font-bold uppercase tracking-[0.08em] text-textprimary">{title}</h4>
      <ul className="space-y-2 text-xs text-textsecondary">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("mailto:") ? (
              <a className="transition hover:text-gold" href={href}>{label}</a>
            ) : (
              <Link className="transition hover:text-gold" href={href}>{label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
