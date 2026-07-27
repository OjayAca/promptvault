import {NextResponse} from "next/server";
import {requireApiAdmin} from "@/lib/auth";
import {createServerSupabase} from "@/lib/supabase/server";
import {apiError, assertSameOrigin, toApiError} from "@/lib/http";
import type {SubscriptionPlan, SubscriptionStatus, UserRole} from "@/lib/types";

const roles: UserRole[] = ["user", "admin"];
const plans: SubscriptionPlan[] = ["Free", "Founding"];
const statuses: SubscriptionStatus[] = ["free", "pending", "active", "past_due", "cancelled", "expired"];

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const supabase = await createServerSupabase();
    const {id} = await params;

    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return apiError("BAD_REQUEST", "Invalid user id.", 400);
    }

    if (!supabase) {
      return apiError("NOT_CONFIGURED", "Admin storage is not configured.", 503);
    }

    const body = await request.json();
    const role = body.role as UserRole;
    const plan = body.plan as SubscriptionPlan;
    const status = body.status as SubscriptionStatus;
    const accessUntil =
      typeof body.accessUntil === "string" && !Number.isNaN(Date.parse(body.accessUntil))
        ? new Date(body.accessUntil).toISOString()
        : null;

    if (!roles.includes(role) || !plans.includes(plan) || !statuses.includes(status)) {
      return apiError("BAD_REQUEST", "Invalid role, plan, or status.", 400);
    }

    if (plan === "Founding" && status === "active" && !accessUntil) {
      return apiError("BAD_REQUEST", "Active Founding access needs an expiration date.", 400);
    }

    const {error} = await supabase.rpc("admin_update_user_access", {
      target_user_id: id,
      next_role: role,
      next_plan: plan,
      next_status: status,
      next_access_until: accessUntil,
    });

    if (error) {
      const knownMessages = [
        "You cannot remove your own admin access",
        "At least one administrator is required",
        "User profile not found",
      ];
      const message = knownMessages.find((item) => error.message.includes(item)) ?? "Unable to update this account.";
      return apiError("CONFLICT", message, 409);
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return toApiError(error);
  }
}
