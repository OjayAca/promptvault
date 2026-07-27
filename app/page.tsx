import {MarketingPage} from "@/components/site/marketing-page";
import {getCurrentUserView} from "@/lib/auth";
import {getPublishedPrompts} from "@/lib/prompts";

export default async function Page() {
  const [items, user] = await Promise.all([getPublishedPrompts(), getCurrentUserView()]);

  return <MarketingPage items={items} user={user} />;
}
