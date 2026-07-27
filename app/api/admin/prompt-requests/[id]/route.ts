import {NextResponse} from "next/server";
import {requireApiAdmin} from "@/lib/auth";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {apiError, assertSameOrigin, toApiError} from "@/lib/http";
import {positiveIntegerId} from "@/lib/validation";

const statuses = ["open", "reviewing", "completed", "rejected"];

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const admin = createSupabaseAdmin();
    const id = positiveIntegerId((await params).id);

    if (!id) {
      return apiError("BAD_REQUEST", "Invalid request id.", 400);
    }

    if (!admin) {
      return apiError("NOT_CONFIGURED", "Admin storage is not configured.", 503);
    }

    const status = String((await request.json()).status ?? "");
    if (!statuses.includes(status)) {
      return apiError("BAD_REQUEST", "Invalid request status.", 400);
    }

    const {data, error} = await admin
      .from("prompt_requests")
      .update({status, updated_at: new Date().toISOString()})
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      return apiError("BAD_REQUEST", "Unable to update prompt request.", 400);
    }

    if (!data) {
      return apiError("NOT_FOUND", "Prompt request not found.", 404);
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return toApiError(error);
  }
}
