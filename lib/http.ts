import {NextResponse} from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "NOT_CONFIGURED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({error: {code, message}}, {status});
}

export function errorMessage(body: unknown, fallback: string) {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object" &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }

  return fallback;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  try {
    if (new URL(origin).origin !== new URL(request.url).origin) {
      throw new HttpError("FORBIDDEN", "Cross-origin request rejected.", 403);
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("FORBIDDEN", "Invalid request origin.", 403);
  }
}

export function safeNextPath(value: string | null | undefined, fallback = "/app") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://promptvault.invalid");
    return parsed.origin === "https://promptvault.invalid"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export class HttpError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function toApiError(error: unknown) {
  if (error instanceof HttpError) {
    return apiError(error.code, error.message, error.status);
  }

  console.error(JSON.stringify({level: "error", message: "Unhandled API error", error: serializeError(error)}));
  return apiError("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
}

function serializeError(error: unknown) {
  return error instanceof Error ? {name: error.name, message: error.message, stack: error.stack} : {value: String(error)};
}
