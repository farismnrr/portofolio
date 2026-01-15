import { RouteGuard } from "@/components";
import { Flex } from "@once-ui-system/core";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex fillWidth fillHeight>
      <RouteGuard>{children}</RouteGuard>
    </Flex>
  );
}
