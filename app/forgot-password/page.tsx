import Link from "next/link";
import {ForgotPasswordForm} from "@/components/app/password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-bgbase px-6 py-10 text-textprimary">
      <section className="mx-auto max-w-md rounded-lg border border-border bg-surface p-8">
        <Link className="font-serif text-2xl font-bold" href="/">PromptVault PH</Link>
        <h1 className="mt-8 font-serif text-4xl">Reset your password</h1>
        <p className="mt-3 text-sm text-textsecondary">We will send a secure recovery link to your verified email.</p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
