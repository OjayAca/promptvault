import {NextResponse} from "next/server";
import {getReadiness} from "@/lib/env";

export function GET() {
  const readiness = getReadiness();

  return NextResponse.json(
    {ready: readiness.ready, billingEnabled: readiness.billingEnabled, missing: readiness.missing},
    {status: readiness.ready ? 200 : 503},
  );
}
