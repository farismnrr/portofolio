import { getBackendUrl } from "@/lib/config/backend";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/v1/auth/logout`, {
      method: "POST",
      headers: authHeader
        ? {
            Authorization: authHeader,
          }
        : {},
    });

    const data = await response.json();

    // Return response and let backend handle cookie clearing
    return NextResponse.json(data, {
      status: response.status,
      headers: response.headers,
    });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 });
  }
}
