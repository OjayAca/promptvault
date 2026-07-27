"use client";

import {useRouter} from "next/navigation";
import {useState, type FormEvent} from "react";
import {categories} from "@/lib/data";
import type {Profile, PromptCategory} from "@/lib/types";
import {errorMessage} from "@/lib/http";

export function AccountForm({profile}: {profile: Profile | null}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        fullName: form.get("fullName"),
        mobileNumber: form.get("mobileNumber"),
        preferredCategory: form.get("preferredCategory") || null,
      }),
    });
    const body = await response.json();

    setLoading(false);

    if (!response.ok) {
      setMessage(errorMessage(body, "Unable to update profile."));
      return;
    }

    setMessage("Profile updated.");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm text-textsecondary">
        Full name
        <input
          className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary outline-none focus:border-gold"
          defaultValue={profile?.fullName ?? ""}
          name="fullName"
          maxLength={120}
          required
          type="text"
        />
      </label>
      <label className="grid gap-2 text-sm text-textsecondary">
        Philippine mobile number
        <input
          className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary outline-none focus:border-gold"
          defaultValue={profile?.mobileNumber ?? ""}
          inputMode="tel"
          name="mobileNumber"
          pattern="(?:\+639|09)\d{9}"
          placeholder="+639171234567"
          type="tel"
        />
      </label>
      <label className="grid gap-2 text-sm text-textsecondary">
        Preferred track
        <select
          className="rounded-lg border border-border bg-bgbase px-4 py-3 text-textprimary outline-none focus:border-gold"
          defaultValue={profile?.preferredCategory ?? ""}
          name="preferredCategory"
        >
          <option value="">No preference</option>
          {categories
            .filter((item): item is PromptCategory => item !== "All")
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>
      </label>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <button className="rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-bgbase" disabled={loading} type="submit">
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
