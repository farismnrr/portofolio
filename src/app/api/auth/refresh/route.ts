import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppConfig } from "@/lib/config/env";

/**
 * Proxy refresh token request to Portfolio Backend
 * This route is called by the frontend to swap the refresh_token cookie
 * for a new access_token.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { status: false, message: "No refresh token cookie found" },
        { status: 401 }
      );
    }

    const { backendUrl, apiKey } = getAppConfig();

    // The backend expects a POST to /v1/auth/refresh
    const response = await fetch(`${backendUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Cookie": `refresh_token=${refreshToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const res = NextResponse.json(data);

    // Forward set-cookie if backend rotates the refresh token
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }

    return res;
  } catch (error) {
    return NextResponse.json(
      { 
        status: false, 
        message: "Failed to connect to backend",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
