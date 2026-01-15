"use client";

import { useAuthStore } from "@/store/auth";
import { useEffect, useRef } from "react";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize();
    }
  }, [initialize]);

  return <>{children}</>;
}
