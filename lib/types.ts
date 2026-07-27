export type AccessLevel = "Free" | "Premium";
export type PromptStatus = "Draft" | "Published" | "Archived";
export type SubscriptionPlan = "Free" | "Founding";
export type SubscriptionStatus = "free" | "pending" | "active" | "past_due" | "cancelled" | "expired";
export type UserRole = "user" | "admin";

export type PromptCategory =
  | "Students"
  | "Teachers"
  | "Business"
  | "Social Media"
  | "Freelancers"
  | "Writing"
  | "Productivity"
  | "Marketing"
  | "Research"
  | "Email";

export type PromptItem = {
  id: number;
  title: string;
  category: PromptCategory;
  access: AccessLevel;
  status?: PromptStatus;
  purpose: string;
  prompt: string | null;
  bestFor: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PricingPlan = {
  name: string;
  label: string;
  priceLabel: string;
  cadence: string;
  description: string;
  features: string[];
  unavailable?: string[];
  highlighted?: boolean;
  ctaLabel: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type AudienceSegment = {
  name: PromptCategory;
  icon: string;
  description: string;
  examples: string[];
};

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  role: UserRole;
  preferredCategory: PromptCategory | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  providerSubscriptionId: string | null;
  providerCheckoutId: string | null;
  providerCustomerId: string | null;
  providerPaymentTokenId: string | null;
  providerLastCycleId: string | null;
  providerLastCycleNumber: number | null;
  providerEventId: string | null;
  providerEventCreatedAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  accessUntil: string | null;
  graceUntil: string | null;
  cancelledAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PromptRequest = {
  id: number;
  userId: string;
  category: PromptCategory;
  title: string;
  details: string;
  status: "open" | "reviewing" | "completed" | "rejected";
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUserView = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  profile: Profile | null;
  subscription: Subscription | null;
};
