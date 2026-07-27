"use client";

import {useCallback, useRef, useState} from "react";

export function useCopyFeedback(timeout = 1800) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (key: string, text: string) => {
      async function fallbackCopy() {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          await fallbackCopy();
        }
      } catch {
        await fallbackCopy();
      }

      setCopiedKey(key);

      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => setCopiedKey(null), timeout);
    },
    [timeout],
  );

  return {copiedKey, copy};
}
