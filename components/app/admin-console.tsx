"use client";

import {useRouter} from "next/navigation";
import {useState, type FormEvent} from "react";
import {categories} from "@/lib/data";
import {errorMessage} from "@/lib/http";
import type {PromptCategory, PromptItem, PromptRequest, Subscription, Profile} from "@/lib/types";

type AdminUser = Profile & {subscription: Subscription | null};

export function AdminConsole({
  prompts,
  users,
  requests,
}: {
  prompts: PromptItem[];
  users: AdminUser[];
  requests: PromptRequest[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function savePrompt(event: FormEvent<HTMLFormElement>, id?: number) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(id ? `/api/admin/prompts/${id}` : "/api/admin/prompts", {
      method: id ? "PATCH" : "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    setMessage(response.ok ? "Prompt saved." : errorMessage(body, "Prompt save failed."));
    router.refresh();
  }

  async function updateUser(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const body = await response.json();
    setMessage(response.ok ? "User updated." : errorMessage(body, "User update failed."));
    router.refresh();
  }

  async function updateRequest(id: number, status: string) {
    const response = await fetch(`/api/admin/prompt-requests/${id}`, {
      method: "PATCH",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({status}),
    });
    const body = await response.json();
    setMessage(response.ok ? "Request updated." : errorMessage(body, "Request update failed."));
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      {message ? <p className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">{message}</p> : null}

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-serif text-2xl text-textprimary">Create Prompt</h2>
        <PromptEditor onSubmit={(event) => savePrompt(event)} />
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-serif text-2xl text-textprimary">Prompt Catalog</h2>
        <div className="mt-5 grid gap-4">
          {prompts.map((prompt) => (
            <details className="rounded-lg border border-border bg-bgbase p-4" key={prompt.id}>
              <summary className="cursor-pointer text-sm font-bold text-textprimary">
                #{prompt.id} {prompt.title} - {prompt.status ?? "Published"}
              </summary>
              <PromptEditor prompt={prompt} onSubmit={(event) => savePrompt(event, prompt.id)} />
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-serif text-2xl text-textprimary">Users & Access</h2>
        <div className="mt-5 grid gap-3">
          {users.map((user) => (
            <form className="grid gap-3 rounded-lg border border-border bg-bgbase p-4 md:grid-cols-[1fr_110px_110px_130px_190px_auto]" key={user.id} onSubmit={(event) => updateUser(event, user.id)}>
              <div>
                <p className="text-sm font-bold text-textprimary">{user.email ?? user.id}</p>
                <p className="text-xs text-textmuted">{user.fullName ?? "No profile name"}</p>
              </div>
              <select className="rounded border border-border bg-surface px-3 py-2 text-sm text-textprimary" defaultValue={user.role} name="role">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <select className="rounded border border-border bg-surface px-3 py-2 text-sm text-textprimary" defaultValue={user.subscription?.plan ?? "Free"} name="plan">
                <option value="Free">Free</option>
                <option value="Founding">Founding</option>
              </select>
              <input
                className="rounded border border-border bg-surface px-3 py-2 text-sm text-textprimary"
                defaultValue={toLocalDateTime(user.subscription?.accessUntil)}
                name="accessUntil"
                type="datetime-local"
              />
              <select className="rounded border border-border bg-surface px-3 py-2 text-sm text-textprimary" defaultValue={user.subscription?.status ?? "free"} name="status">
                {["free", "pending", "active", "past_due", "cancelled", "expired"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button className="rounded bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-bgbase" type="submit">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-serif text-2xl text-textprimary">Prompt Requests</h2>
        <div className="mt-5 grid gap-3">
          {requests.length === 0 ? <p className="text-sm text-textsecondary">No requests yet.</p> : null}
          {requests.map((request) => (
            <article className="rounded-lg border border-border bg-bgbase p-4" key={request.id}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-bold text-textprimary">{request.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-gold">{request.category}</p>
                  <p className="mt-2 text-sm text-textsecondary">{request.details}</p>
                  <p className="mt-2 text-xs text-textmuted">Status: {request.status}</p>
                </div>
                <select
                  className="rounded border border-border bg-surface px-3 py-2 text-sm text-textprimary"
                  defaultValue={request.status}
                  onChange={(event) => updateRequest(request.id, event.target.value)}
                >
                  {["open", "reviewing", "completed", "rejected"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PromptEditor({prompt, onSubmit}: {prompt?: PromptItem; onSubmit: (event: FormEvent<HTMLFormElement>) => void}) {
  return (
    <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-4">
        <input className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.title ?? ""} maxLength={160} name="title" placeholder="Title" required />
        <select className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.category ?? "Students"} name="category">
          {categories
            .filter((item): item is PromptCategory => item !== "All")
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>
        <select className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.access ?? "Free"} name="access">
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
        </select>
        <select className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.status ?? "Published"} name="status">
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
      </div>
      <input className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.purpose ?? ""} maxLength={500} name="purpose" placeholder="Purpose" required />
      <textarea className="min-h-32 rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.prompt ?? ""} maxLength={12000} name="prompt" placeholder="Prompt body" required />
      <input className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.bestFor ?? ""} maxLength={500} name="bestFor" placeholder="Best for" required />
      <input className="rounded border border-border bg-bgbase px-3 py-2 text-sm text-textprimary" defaultValue={prompt?.tags?.join(", ") ?? ""} name="tags" placeholder="Comma-separated tags" />
      <button className="self-start rounded bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-bgbase" type="submit">
        Save Prompt
      </button>
    </form>
  );
}

function toLocalDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
