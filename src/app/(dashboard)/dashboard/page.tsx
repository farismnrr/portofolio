"use client";

import { useAuthStore } from "@/store/auth";
import { Column, Heading, Row, Text } from "@once-ui-system/core";

export default function DashboardPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  return (
    <Column gap="24">
      <Column fillWidth gap="m">
        <Row fillWidth horizontal="between" vertical="center">
          <Heading variant="display-strong-m">Dashboard</Heading>
        </Row>
      </Column>

      {user && (
        <Column
          background="surface"
          border="neutral-strong"
          radius="m"
          padding="m"
          gap="s"
          maxWidth={64}
        >
          <Heading variant="heading-strong-xs">User Information</Heading>
          <Column gap="xs">
            <Row gap="s">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Username:
              </Text>
              <Text variant="body-default-s" onBackground="neutral-strong">
                {user.username}
              </Text>
            </Row>
            <Row gap="s">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Email:
              </Text>
              <Text variant="body-default-s" onBackground="neutral-strong">
                {user.email}
              </Text>
            </Row>
            <Row gap="s">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Role:
              </Text>
              <Text variant="body-default-s" onBackground="neutral-strong">
                {user.role}
              </Text>
            </Row>
          </Column>
        </Column>
      )}

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
