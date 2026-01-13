"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function CallbackContent() {
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      // Extract token from hash fragment
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");

      if (accessToken) {
        // Store token securely
        sessionStorage.setItem("access_token", accessToken);

        // Clear hash from URL for security
        window.history.replaceState(null, "", window.location.pathname);

        // Navigate to home
        router.replace("/");
      } else {
        router.replace("/auth/login");
      }
    };

    processCallback();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <p style={{ color: "#666" }}>Authenticating...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
