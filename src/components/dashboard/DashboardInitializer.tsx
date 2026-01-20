"use client";

import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";

/**
 * Client component that initializes auth store when dashboard mounts
 */
export function DashboardInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    if (isInitializing) {
      initialize();
    }
  }, [initialize, isInitializing]);

  return <>{children}</>;
}
