import {NextResponse} from "next/server";
import {requireApiUser} from "@/lib/auth";
import {createServerSupabase} from "@/lib/supabase/server";
import {categories} from "@/lib/data";
import {hasPremiumAccess} from "@/lib/access";
import {apiError, assertSameOrigin, toApiError} from "@/lib/http";
import {cleanString} from "@/lib/validation";
import type {PromptCategory} from "@/lib/types";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    const supabase = await createServerSupabase();

    if (!supabase) {
      return apiError("NOT_CONFIGURED", "Prompt requests are not configured.", 503);
    }

    if (!hasPremiumAccess(user.profile, user.subscription)) {
      return apiError("FORBIDDEN", "An active Founding membership is required.", 403);
    }

    const body = await request.json();
    const title = cleanString(body.title, 160);
    const details = cleanString(body.details, 3000);
    const category = body.category as PromptCategory;

    if (title.length < 3 || details.length < 10) {
      return apiError("BAD_REQUEST", "Add a title and at least 10 characters of detail.", 400);
    }

    if (!categories.filter((item) => item !== "All").includes(category)) {
      return apiError("BAD_REQUEST", "Choose a valid category.", 400);
    }

    const {count, error: countError} = await supabase
      .from("prompt_requests")
      .select("id", {count: "exact", head: true})
      .eq("user_id", user.id)
      .in("status", ["open", "reviewing"]);

    if (countError) {
      throw countError;
    }

    if ((count ?? 0) >= 3) {
      return apiError("RATE_LIMITED", "Complete an existing request before submitting another.", 429);
    }

    const {error} = await supabase.from("prompt_requests").insert({
      user_id: user.id,
      category,
      title,
      details,
      status: "open",
    });

    if (error) {
      console.error(JSON.stringify({level: "error", message: "Prompt request failed", userId: user.id, error: error.message}));
      return apiError("BAD_REQUEST", "Unable to submit the request.", 400);
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return toApiError(error);
  }
}
