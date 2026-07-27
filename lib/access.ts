import type {Profile, Subscription} from "@/lib/types";

export function hasPremiumAccess(
  profile: Profile | null,
  subscription: Subscription | null,
  now = new Date(),
) {
  if (profile?.role === "admin") {
    return true;
  }

  if (subscription?.plan !== "Founding") {
    return false;
  }

  const paidAccess = subscription.accessUntil && new Date(subscription.accessUntil).getTime() > now.getTime();
  const retryAccess =
    subscription.status === "past_due" &&
    subscription.graceUntil &&
    new Date(subscription.graceUntil).getTime() > now.getTime();

  return Boolean(paidAccess || retryAccess);
}
