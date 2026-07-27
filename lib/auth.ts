import {redirect} from "next/navigation";
import {createServerSupabase} from "@/lib/supabase/server";
import {hasPremiumAccess} from "@/lib/access";
import {rowToProfile, rowToSubscription} from "@/lib/mappers";
import type {AuthUserView} from "@/lib/types";
import {HttpError} from "@/lib/http";

export async function getCurrentUserView(): Promise<AuthUserView | null> {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return null;
  }

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{data: profile}, {data: subscription}] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", {ascending: false})
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
    profile: profile ? rowToProfile(profile as ProfileRowLike) : null,
    subscription: subscription ? rowToSubscription(subscription as SubscriptionRowLike) : null,
  };
}

export async function requireUser() {
  const view = await getCurrentUserView();

  if (!view) {
    redirect("/login");
  }

  return view;
}

export async function requireAdmin() {
  const view = await requireUser();

  if (view.profile?.role !== "admin") {
    redirect("/app");
  }

  return view;
}

export async function requireApiUser() {
  const view = await getCurrentUserView();
  if (!view) throw new HttpError("FORBIDDEN", "Authentication required.", 401);
  return view;
}

export async function requireApiAdmin() {
  const view = await requireApiUser();
  if (view.profile?.role !== "admin") throw new HttpError("FORBIDDEN", "Administrator access required.", 403);
  return view;
}

type ProfileRowLike = Parameters<typeof rowToProfile>[0];
type SubscriptionRowLike = Parameters<typeof rowToSubscription>[0];

export {hasPremiumAccess};
