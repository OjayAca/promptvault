import {NextResponse} from "next/server";
import {requireApiAdmin} from "@/lib/auth";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {apiError, assertSameOrigin, toApiError} from "@/lib/http";
import {toPromptPayload} from "@/lib/prompt-validation";
import {positiveIntegerId} from "@/lib/validation";

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const admin = createSupabaseAdmin();
    const id = positiveIntegerId((await params).id);

    if (!id) {
      return apiError("BAD_REQUEST", "Invalid prompt id.", 400);
    }

    if (!admin) {
      return apiError("NOT_CONFIGURED", "Admin storage is not configured.", 503);
    }

    const payload = toPromptPayload(await request.json());

    if ("error" in payload) {
      return apiError("BAD_REQUEST", payload.error, 400);
    }

    const {data, error} = await admin.from("prompts").update(payload).eq("id", id).select("id").maybeSingle();

    if (error) {
      console.error(JSON.stringify({level: "error", message: "Admin prompt update failed", promptId: id, error: error.message}));
      return apiError("BAD_REQUEST", "Unable to update prompt.", 400);
    }

    if (!data) {
      return apiError("NOT_FOUND", "Prompt not found.", 404);
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return toApiError(error);
  }
}
