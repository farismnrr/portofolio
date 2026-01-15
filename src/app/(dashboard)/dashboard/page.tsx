"use client";

import { useAuthStore } from "@/store/auth";
import { Column, Heading, Text } from "@once-ui-system/core";

export default function DashboardPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <Column gap="24">
      <Heading variant="display-strong-m">Dashboard</Heading>
      <Text variant="body-default-l" onBackground="neutral-weak">
        Welcome to your dashboard. Select an option from the sidebar to get started.
      </Text>

      <Column
        background="surface"
        border="neutral-strong"
        radius="m"
        padding="m"
        gap="s"
        maxWidth={64}
      >
        <Heading variant="heading-strong-xs">Debug: Access Token</Heading>
        <Text
          variant="code-default-s"
          onBackground="neutral-medium"
          style={{ wordBreak: "break-all" }}
        >
          {accessToken || "No access token found"}
        </Text>
      </Column>
    </Column>
  );
}
