import Link from "next/link";
import {AdminConsole} from "@/components/app/admin-console";
import {requireAdmin} from "@/lib/auth";
import {rowToProfile, rowToSubscription} from "@/lib/mappers";
import {getAllPromptsForAdmin} from "@/lib/prompts";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import type {PromptRequest, Subscription} from "@/lib/types";

export default async function AdminPage() {
  await requireAdmin();
  const admin = createSupabaseAdmin();
  const prompts = await getAllPromptsForAdmin();

  const [profilesResult, subscriptionsResult, requestsResult] = admin
    ? await Promise.all([
        admin.from("profiles").select("*").order("created_at", {ascending: false}),
        admin.from("subscriptions").select("*"),
        admin.from("prompt_requests").select("*").order("created_at", {ascending: false}),
      ])
    : [{data: []}, {data: []}, {data: []}];

  const subscriptionsByUser = new Map<string, Subscription>(
    (subscriptionsResult.data ?? []).map((row) => {
      const subscription = rowToSubscription(row as Parameters<typeof rowToSubscription>[0]);
      return [subscription.userId, subscription];
    }),
  );
  const users = (profilesResult.data ?? []).map((row) => {
    const profile = rowToProfile(row as Parameters<typeof rowToProfile>[0]);
    return {...profile, subscription: subscriptionsByUser.get(profile.id) ?? null};
  });
  const requests = (requestsResult.data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    title: row.title,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) as PromptRequest[];

  return (
    <main className="relative min-h-screen overflow-hidden bg-bgbase px-6 py-10 text-textprimary">
      <div className="mesh-gradient" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <Link className="text-sm text-textsecondary transition hover:text-gold" href="/app">
          Back to dashboard
        </Link>
        <header className="mt-8 border-b border-border pb-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">Admin Operations</p>
          <h1 className="mt-2 font-serif text-4xl text-textprimary md:text-5xl">Prompt CMS</h1>
          <p className="mt-3 max-w-2xl text-sm text-textsecondary">
            Manage prompts, member roles, subscription access mirrors, and request tickets.
          </p>
        </header>
        <section className="mt-8">
          <AdminConsole prompts={prompts} users={users} requests={requests} />
        </section>
      </div>
    </main>
  );
}
