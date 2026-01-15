"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Flex } from "@once-ui-system/core";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Flex fillWidth style={{ minHeight: "100vh" }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Flex
        fillWidth
        direction="column"
        style={{
          marginLeft: isMobile ? "0" : isCollapsed ? "80px" : "280px",
          padding: "2rem",
          background: "var(--background)",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
}
