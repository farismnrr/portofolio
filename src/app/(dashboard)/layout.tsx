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
      <RouteGuard>
        <DashboardInitializer>{children}</DashboardInitializer>
      </RouteGuard>
    </Flex>
  );
}
