"use client";

import { useAuthStore } from "@/store/auth";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./Sidebar.module.scss";

/**
 * Client component that initializes auth store AND renders the dashboard shell (Sidebar + Main)
 */
export function DashboardInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(true);
    }
  }, [initialize]);

  return (
    <div className={styles.container}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`${styles.main} ${isCollapsed ? styles.expanded : ""}`}>{children}</main>
    </div>
  );
}
