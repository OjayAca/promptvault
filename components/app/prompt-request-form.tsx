"use client";

import {Send} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState, type FormEvent} from "react";
import {categories} from "@/lib/data";
import {errorMessage} from "@/lib/http";

export function PromptRequestForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/prompt-requests", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        title: form.get("title"),
        category: form.get("category"),
        details: form.get("details"),
      }),
    });
    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(errorMessage(body, "Unable to submit request."));
      return;
    }

    event.currentTarget.reset();
    setMessage("Request submitted.");
    router.refresh();
  }

  return (
    <form className="grid gap-3 rounded-lg border border-border bg-surface p-5" onSubmit={submit}>
      <h2 className="font-serif text-xl text-textprimary">Request a Prompt</h2>
      <select className="rounded-lg border border-border bg-bgbase px-4 py-3 text-sm text-textprimary" name="category" required>
        <option value="">Choose a category</option>
        {categories.filter((category) => category !== "All").map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <input
        className="rounded-lg border border-border bg-bgbase px-4 py-3 text-sm text-textprimary outline-none focus:border-gold"
        name="title"
        maxLength={160}
        placeholder="Prompt title or outcome"
        required
        type="text"
      />
      <textarea
        className="min-h-28 rounded-lg border border-border bg-bgbase px-4 py-3 text-sm text-textprimary outline-none focus:border-gold"
        name="details"
        maxLength={3000}
        minLength={10}
        placeholder="Describe the workflow, audience, tone, and output format you need."
        required
      />
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-bgbase" disabled={loading} type="submit">
        <Send className="h-4 w-4" />
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
