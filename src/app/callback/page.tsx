"use client";

import { useAuthStore } from "@/store/auth";
import { Button, Column, Flex, Heading, Spinner, Text } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [error, setError] = useState<string | null>(null);

  const handleCallback = useCallback(async () => {
    try {
      // Extract token from hash fragment
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      console.log("Callback: Parsed tokens", { accessToken: Boolean(accessToken), refreshToken: Boolean(refreshToken) });

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // If we have a refresh token, set it as a cookie on our domain
      if (refreshToken) {
        console.log("Callback: Attempting to set cookie...");
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!loginRes.ok) {
          const errText = await loginRes.text();
          console.error("Callback: Failed to set session cookie", loginRes.status, errText);
        } else {
          console.log("Callback: Cookie set successfully");
        }
      } else {
        console.warn("Callback: No refresh token found in URL hash!");
      }

      // Store access token in Zustand store (memory)
      setAccessToken(accessToken);

      // Clear URL hash for security
      window.history.replaceState(null, "", window.location.pathname);

      // Redirect to original destination or dashboard
      const redirect = sessionStorage.getItem("sso_redirect") || "/dashboard";
      sessionStorage.removeItem("sso_redirect");

      router.push(redirect);
    } catch (err) {
      console.error("Callback error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }, [router, setAccessToken]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  if (error) {
    return (
      <Flex
        fillWidth
        fillHeight
        style={{ minHeight: "100vh" }}
        center
        background="surface"
        padding="l"
      >
        <Column
          center
          background="neutral-weak"
          border="neutral-strong"
          radius="l"
          padding="xl"
          gap="l"
          maxWidth={32}
        >
          <Heading variant="display-default-xs" align="center" onBackground="danger-weak">
            ⚠️ Authentication Failed
          </Heading>
          <Text align="center" onBackground="neutral-medium">
            {error}
          </Text>
          <Button variant="primary" onClick={() => router.push("/login")}>
            Try Again
          </Button>
        </Column>
      </Flex>
    );
  }

  return (
    <Flex fillWidth fillHeight style={{ minHeight: "100vh" }} center background="surface">
      <Column center gap="l">
        <Spinner size="l" />
        <Text variant="body-default-l" onBackground="neutral-medium">
          Authenticating...
        </Text>
      </Column>
    </Flex>
  );
}
