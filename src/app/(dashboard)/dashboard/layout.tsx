import Sidebar from "@/components/dashboard/Sidebar";
import { Flex } from "@once-ui-system/core";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex fillWidth style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Flex
        fillWidth
        direction="column"
        style={{
          marginLeft: "280px", // Match sidebar width
          padding: "2rem",
          background: "var(--background)", // Ensure background matches theme
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
}
