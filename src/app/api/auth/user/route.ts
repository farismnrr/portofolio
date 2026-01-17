import { getSsoConfig } from "@/lib/config/env";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "No authorization header found" }, { status: 401 });
    }

    // Determine backend URL
    const { url: ssoUrl } = getSsoConfig();
    // Using /auth/verify which validates token and returns user data
    const userEndpoint = `${ssoUrl}/auth/verify`;

    // Forward the request to the backend with API Key for tenant validation
    const backendResponse = await fetch(userEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });

    if (!backendResponse.ok) {
      // If 404, maybe try /api/users/me?
      // But for now return error
      const error = await backendResponse.text();

      return NextResponse.json(
        { message: "Failed to fetch user" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
