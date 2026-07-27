import Link from "next/link";
import {ResetPasswordForm} from "@/components/app/password-form";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-bgbase px-6 py-10 text-textprimary">
      <section className="mx-auto max-w-md rounded-lg border border-border bg-surface p-8">
        <Link className="font-serif text-2xl font-bold" href="/">PromptVault PH</Link>
        <h1 className="mt-8 font-serif text-4xl">Choose a new password</h1>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
