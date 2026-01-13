import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ssoUrl: process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:5500",
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID || "",
  });
}
