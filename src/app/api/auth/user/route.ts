import { getBackendUrl } from "@/lib/config/backend";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "No authorization header" },
        { status: 401 },
      );
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Failed to fetch user" }, { status: 500 });
  }
}
