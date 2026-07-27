"use client";

import {Check, Copy, Lock} from "lucide-react";
import {PromptText} from "@/components/ui/prompt-text";
import {useCopyFeedback} from "@/hooks/use-copy-feedback";
import type {PromptItem} from "@/lib/types";

type PromptCardProps = {
  item: PromptItem;
  compact?: boolean;
  locked?: boolean;
};

export function PromptCard({item, compact = false, locked = false}: PromptCardProps) {
  const {copiedKey, copy} = useCopyFeedback();
  const copyKey = `prompt-${item.id}`;
  const copied = copiedKey === copyKey;
  const isLocked = locked || item.prompt === null;

  return (
    <article className={`vault-card flex h-full flex-col justify-between ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded border border-border bg-elevated px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-textsecondary">
            {item.category}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
              item.access === "Free"
                ? "border-teal/20 bg-teal/10 text-teal"
                : "border-gold/20 bg-gold/10 text-gold"
            }`}
          >
            {item.access}
          </span>
        </div>
        <div>
          <h3 className={`${compact ? "text-lg" : "text-2xl"} font-serif font-bold leading-tight text-textprimary`}>
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-textsecondary">{item.purpose}</p>
        </div>
        <div className="relative">
          {isLocked ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-r-md bg-bgbase/70 backdrop-blur-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-gold">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Upgrade to copy
              </span>
            </div>
          ) : null}
          <div className={`${isLocked ? "select-none" : "select-all"} max-h-44 min-h-24 overflow-auto rounded-r-md border-l-2 border-gold bg-elevated p-4 font-mono text-xs leading-relaxed text-textsecondary`}>
            {!compact ? (
              <span className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-textmuted">
                {`// dynamic custom template`}
              </span>
            ) : null}
            {item.prompt ? (
              <PromptText text={item.prompt} />
            ) : (
              <span className="text-textmuted">Premium prompt text is available to active Founding members.</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-textmuted">
          Best for: <span className="text-textsecondary">{item.bestFor}</span>
        </span>
        <button
          className={`inline-flex items-center justify-center gap-2 rounded border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
            copied
              ? "border-gold bg-gold/10 text-gold"
              : "border-border bg-white/5 text-textprimary hover:border-gold hover:bg-elevated hover:text-gold"
          } ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
          disabled={isLocked}
          onClick={() => item.prompt && copy(copyKey, item.prompt)}
          type="button"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : isLocked ? "Locked" : "Copy Prompt"}
        </button>
      </div>
    </article>
  );
}
