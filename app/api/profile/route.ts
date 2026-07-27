import {NextResponse} from "next/server";
import {categories} from "@/lib/data";
import {requireApiUser} from "@/lib/auth";
import {createServerSupabase} from "@/lib/supabase/server";
import type {PromptCategory} from "@/lib/types";
import {apiError, assertSameOrigin, toApiError} from "@/lib/http";
import {cleanString, normalizePhilippineMobile} from "@/lib/validation";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    const supabase = await createServerSupabase();

    if (!supabase) {
      return apiError("NOT_CONFIGURED", "Account storage is not configured.", 503);
    }

    const body = await request.json();
    const fullName = cleanString(body.fullName, 120);
    const mobileNumber = body.mobileNumber ? normalizePhilippineMobile(body.mobileNumber) : null;
    const preferredCategory = body.preferredCategory as PromptCategory | null;
    const allowedCategories = categories.filter((item) => item !== "All");

    if (!fullName) {
      return apiError("BAD_REQUEST", "Full name is required.", 400);
    }

    if (body.mobileNumber && !mobileNumber) {
      return apiError("BAD_REQUEST", "Use a valid Philippine mobile number, such as +639171234567.", 400);
    }

    if (preferredCategory && !allowedCategories.includes(preferredCategory)) {
      return apiError("BAD_REQUEST", "Invalid preferred category.", 400);
    }

    const {error} = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        mobile_number: mobileNumber,
        preferred_category: preferredCategory || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error(JSON.stringify({level: "error", message: "Profile update failed", userId: user.id, error: error.message}));
      return apiError("BAD_REQUEST", "Unable to update profile.", 400);
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return toApiError(error);
  }
}
