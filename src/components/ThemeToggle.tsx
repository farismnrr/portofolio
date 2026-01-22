"use client";

import { ToggleButton, useTheme } from "@once-ui-system/core";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export const ThemeToggle: React.FC = () => {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");

    // Observe changes to the data-theme attribute so this component stays in sync
    observerRef.current = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
    });

    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (!mounted) return null;

  const icon = currentTheme === "dark" ? "light" : "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  return (
    <ToggleButton
      prefixIcon={icon}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
    />
  );
};
