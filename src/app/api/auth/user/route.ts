import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "No authorization header found" }, { status: 401 });
    }

    // Determine backend URL
    const ssoUrl = process.env.SSO_URL || "http://localhost:5500";
    // Using /auth/verify which validates token and returns user data
    const userEndpoint = `${ssoUrl}/auth/verify`;

    // Forward the request to the backend
    const backendResponse = await fetch(userEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!backendResponse.ok) {
      // If 404, maybe try /api/users/me?
      // But for now return error
      const error = await backendResponse.text();
      console.error("Backend user fetch failed:", error);
      return NextResponse.json(
        { message: "Failed to fetch user" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("User proxy error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
