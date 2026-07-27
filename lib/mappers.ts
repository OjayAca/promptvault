import type {AccessLevel, Profile, PromptCategory, PromptItem, PromptStatus, Subscription, SubscriptionPlan, SubscriptionStatus, UserRole} from "@/lib/types";

type PromptRow = {
  id: number;
  title: string;
  category: PromptCategory;
  access: AccessLevel;
  status?: PromptStatus | null;
  purpose: string;
  prompt: string | null;
  best_for: string;
  tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  mobile_number: string | null;
  role: UserRole;
  preferred_category: PromptCategory | null;
  created_at?: string;
  updated_at?: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider_subscription_id: string | null;
  provider_checkout_id: string | null;
  provider_customer_id: string | null;
  provider_payment_token_id: string | null;
  provider_last_cycle_id: string | null;
  provider_last_cycle_number: number | null;
  provider_event_id: string | null;
  provider_event_created_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  access_until: string | null;
  grace_until: string | null;
  cancelled_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export function rowToPrompt(row: PromptRow): PromptItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    access: row.access,
    status: row.status ?? "Published",
    purpose: row.purpose,
    prompt: row.prompt,
    bestFor: row.best_for,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function promptToRow(prompt: Omit<PromptItem, "createdAt" | "updatedAt">) {
  return {
    id: prompt.id,
    title: prompt.title,
    category: prompt.category,
    access: prompt.access,
    status: prompt.status ?? "Published",
    purpose: prompt.purpose,
    prompt: prompt.prompt,
    best_for: prompt.bestFor,
    tags: prompt.tags ?? [],
  };
}

export function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    mobileNumber: row.mobile_number,
    role: row.role,
    preferredCategory: row.preferred_category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan,
    status: row.status,
    providerSubscriptionId: row.provider_subscription_id,
    providerCheckoutId: row.provider_checkout_id,
    providerCustomerId: row.provider_customer_id,
    providerPaymentTokenId: row.provider_payment_token_id,
    providerLastCycleId: row.provider_last_cycle_id,
    providerLastCycleNumber: row.provider_last_cycle_number,
    providerEventId: row.provider_event_id,
    providerEventCreatedAt: row.provider_event_created_at,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    accessUntil: row.access_until,
    graceUntil: row.grace_until,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
