"use client";

import { getAppConfig } from "@/lib/config/env";
import { Column, Spinner, Text } from "@once-ui-system/core";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const initAuth = async () => {
      try {
        setStatus("Loading configuration...");
        const config = getAppConfig();
        const ssoUrl = config.ssoUrl;
        const tenantId = config.tenantId;

        const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);

        // SSO will generate state/nonce automatically
        setStatus("Redirecting to login...");
        window.location.href = `${ssoUrl}/login?tenant_id=${tenantId}&redirect_uri=${redirectUri}&role=admin`;
      } catch (_error) {
        setStatus("Error loading configuration");
      }
    };

    initAuth();
  }, []);

  return (
    <Column fillWidth horizontal="center" vertical="center" style={{ minHeight: "100vh" }} gap="24">
      <Spinner />
      <Text variant="body-default-l" onBackground="neutral-weak">
        {status}
      </Text>
    </Column>
  );
}
