import Link from "next/link";
import {AccountForm} from "@/components/app/account-form";
import {SignOutButton} from "@/components/app/sign-out-button";
import {requireUser} from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-bgbase px-6 py-10 text-textprimary">
      <div className="mesh-gradient" />
      <section className="relative z-10 mx-auto max-w-4xl rounded-lg border border-border bg-surface p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Link className="text-sm text-textsecondary transition hover:text-gold" href="/app">
              Back to dashboard
            </Link>
            <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">Account Settings</p>
            <h1 className="mt-2 font-serif text-4xl text-textprimary">Profile & access</h1>
            <p className="mt-3 text-sm text-textsecondary">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
          <AccountForm profile={user.profile} />
          <aside className="rounded-lg border border-border bg-bgbase p-5">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">Current plan</p>
            <h2 className="mt-2 font-serif text-2xl text-textprimary">{user.subscription?.plan ?? "Free"}</h2>
            <p className="mt-2 text-sm text-textsecondary">Status: {user.subscription?.status ?? "free"}</p>
            <Link className="mt-5 inline-flex rounded-lg bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-bgbase" href="/billing">
              Manage Billing
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
