import { getAppConfig } from "@/lib/config/env";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { backendUrl, apiKey } = getAppConfig();

  try {
    // 1. Ambil semua headers dari browser (termasuk Cookie: refresh_token=...)
    const headers = new Headers(req.headers);

    // 2. Tambahin API Key buat internal auth ke Go Backend
    headers.set("X-API-Key", apiKey);

    // 3. Hapus Host original biar gak konflik di Backend
    headers.delete("host");

    // 4. "Lempar" lurus ke Go Backend
    const response = await fetch(`${backendUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: headers,
      cache: "no-store",
    });

    // 5. Apapun hasilnya (200, 401, set-cookie dari BE, dll), balikin lurus ke browser
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "set-cookie": response.headers.get("set-cookie") || "",
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { status: false, message: "Proxy connection failed" },
      { status: 502 },
    );
  }
}
