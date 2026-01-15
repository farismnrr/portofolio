import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "No refresh token found" }, { status: 401 });
    }

    // Determine backend URL
    const ssoUrl = process.env.SSO_URL || "http://localhost:5500";
    const refreshEndpoint = `${ssoUrl}/api/auth/refresh`;

    // Forward the request to the backend
    const backendResponse = await fetch(refreshEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
        // Add API Key if required by the backend public scope
        // "X-API-Key": process.env.API_KEY || "",
      },
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.text();
      console.error("Backend refresh failed:", error);
      return NextResponse.json(
        { message: "Failed to refresh token" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();

    // The backend might set a new refresh token in the response headers.
    // We should forward that Set-Cookie header if it exists.
    const res = NextResponse.json(data, { status: 200 });

    const newRefreshToken = backendResponse.headers.get("set-cookie");
    if (newRefreshToken) {
      res.headers.set("Set-Cookie", newRefreshToken);
    }

    return res;
  } catch (error) {
    console.error("Refresh proxy error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
