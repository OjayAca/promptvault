"use client";

import {ChevronDown} from "lucide-react";
import {useState} from "react";
import type {FaqItem} from "@/lib/types";

type AccordionGroupProps = {
  items: FaqItem[];
  itemTitleClassName?: string;
};

export function AccordionGroup({items, itemTitleClassName = "font-serif text-sm font-bold"}: AccordionGroupProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div className="vault-card overflow-hidden border border-border" key={item.question}>
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span className={`${itemTitleClassName} text-textprimary`}>{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-textsecondary transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-sm leading-relaxed text-textsecondary">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
