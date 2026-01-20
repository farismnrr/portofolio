import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
  }

  const ssoUrl = process.env.SSO_URL || "https://sso.farismunir.my.id";
  const apiKey = process.env.API_KEY || "iotnet_dev_api_key_2024";

  try {
    const response = await fetch(`${ssoUrl}/auth/refresh`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Cookie: `refresh_token=${refreshToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Proxy the set-cookie header if any (for rotation)
    const res = NextResponse.json(data);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }

    return res;
  } catch (_error) {
    return NextResponse.json(
      { status: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
