"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ControlsCard } from "@/components/dashboard/thumbnail/ControlsCard";
import { PreviewCard } from "@/components/dashboard/thumbnail/PreviewCard";
import { useRef, useState } from "react";
import styles from "./page.module.scss";

type DeviceType = "website" | "mobile";

export default function ThumbnailPage() {
  const [screenCount, setScreenCount] = useState(4);
  const [deviceType, setDeviceType] = useState<DeviceType>("website");
  const [rotation, setRotation] = useState(15);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#f5f5f5",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1>Thumbnail Generator</h1>
          <p>Create clean, professional portfolio thumbnails in seconds.</p>
        </div>
        <ThemeToggle />
      </header>

      <div className={styles.layout}>
        {/* LEFT – CONTROLS */}
        <ControlsCard
          screenCount={screenCount}
          setScreenCount={setScreenCount}
          deviceType={deviceType}
          setDeviceType={setDeviceType}
          rotation={rotation}
          setRotation={setRotation}
          onExport={handleExport}
        />

        {/* RIGHT – PREVIEW */}
        <PreviewCard
          canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
          screenCount={screenCount}
          deviceType={deviceType}
          rotation={rotation}
        />
      </div>
    </div>
  );
}
