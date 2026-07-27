import {AppShell} from "@/components/app/app-shell";
import {requireUser} from "@/lib/auth";
import {getPublishedPrompts} from "@/lib/prompts";

export default async function DashboardPage() {
  const [user, items] = await Promise.all([requireUser(), getPublishedPrompts()]);

  return <AppShell items={items} user={user} />;
}
