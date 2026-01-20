"use client";

import { useAuthStore } from "@/store/auth";
import { useEffect, useRef } from "react";

/**
 * Client component that initializes auth store when dashboard mounts
 */
export function DashboardInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(true);
    }
  }, [initialize]);

  return <>{children}</>;
}
