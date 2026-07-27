import Link from "next/link";
import type {ReactNode} from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-gold text-bgbase shadow-lg shadow-gold/10 hover:bg-gold/90",
  secondary:
    "border border-gold/40 bg-gold/5 text-gold hover:border-gold hover:bg-gold/10",
  ghost:
    "border border-border bg-white/5 text-textprimary hover:border-gold hover:bg-elevated hover:text-gold",
};

export function ButtonLink({href, children, variant = "primary", className = ""}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-center text-xs font-extrabold uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
