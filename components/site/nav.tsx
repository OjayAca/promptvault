"use client";

import {Menu, X} from "lucide-react";
import Link from "next/link";
import {useEffect, useState} from "react";

const links = [
  ["How It Works", "/#how-it-works"],
  ["Free Prompts", "/#featured"],
  ["Library", "/#library-browser"],
  ["Pricing", "/#pricing"],
  ["Customize", "/#customization"],
  ["FAQ", "/#faq"],
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, {passive: true});
    requestAnimationFrame(onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition ${
        scrolled ? "border-border bg-bgbase/90 shadow-2xl" : "border-transparent bg-bgbase/75"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link className="font-serif text-2xl font-bold tracking-normal text-textprimary" href="/">
          Prompt<span className="text-gold">V</span>ault <span className="text-gold">PH</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          {links.map(([label, href]) => (
            <Link className="text-textsecondary transition hover:text-gold" href={href} key={label}>
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link className="px-4 py-2 text-sm font-medium text-textsecondary transition hover:text-textprimary" href="/login">
            Sign In
          </Link>
          <Link
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-bgbase shadow-lg shadow-gold/10 transition hover:bg-gold/90"
            href="/signup"
          >
            Get Started Free
          </Link>
        </div>

        <button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label="Toggle menu"
          className="inline-flex rounded-md p-2 text-textsecondary transition hover:text-textprimary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-x-0 top-20 z-40 flex h-[calc(100vh-80px)] flex-col justify-between border-t border-border bg-bgbase/98 p-8 backdrop-blur-lg md:hidden"
          id="mobile-menu"
        >
          <div className="flex flex-col gap-6 text-xl font-medium">
            {links.map(([label, href]) => (
              <Link className="text-textsecondary transition hover:text-gold" href={href} key={label} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <Link className="rounded-full border border-border py-3.5 text-center font-medium text-textprimary" href="/login">
              Sign In
            </Link>
            <Link className="rounded-full bg-gold py-3.5 text-center font-bold uppercase tracking-[0.08em] text-bgbase" href="/signup">
              Get Started Free
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
