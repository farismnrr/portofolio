import { getSsoConfig } from "@/lib/config/env";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { url, tenantId } = getSsoConfig();
  return NextResponse.json({
    ssoUrl: url,
    tenantId,
  });
}
