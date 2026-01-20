import { RouteGuard } from "@/components";
import { DashboardInitializer } from "@/components/dashboard/DashboardInitializer";
import { Flex } from "@once-ui-system/core";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex fillWidth fillHeight>
      <DashboardInitializer>
        <RouteGuard>{children}</RouteGuard>
      </DashboardInitializer>
    </Flex>
  );
}
