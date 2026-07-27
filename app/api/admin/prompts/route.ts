import {NextResponse} from "next/server";
import {requireApiAdmin} from "@/lib/auth";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {apiError, assertSameOrigin, toApiError} from "@/lib/http";
import {toPromptPayload} from "@/lib/prompt-validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const admin = createSupabaseAdmin();

    if (!admin) {
      return apiError("NOT_CONFIGURED", "Admin storage is not configured.", 503);
    }

    const payload = toPromptPayload(await request.json());

    if ("error" in payload) {
      return apiError("BAD_REQUEST", payload.error, 400);
    }

    const {data, error} = await admin.from("prompts").insert(payload).select("id").single();

    if (error) {
      console.error(JSON.stringify({level: "error", message: "Admin prompt create failed", error: error.message}));
      return apiError("BAD_REQUEST", "Unable to create prompt.", 400);
    }

    return NextResponse.json({ok: true, id: data.id}, {status: 201});
  } catch (error) {
    return toApiError(error);
  }
}
