"use client";

import { ControlsCard } from "@/components/dashboard/thumbnail/ControlsCard";
import styles from "@/components/dashboard/thumbnail/Page.module.scss";
import { PreviewCard } from "@/components/dashboard/thumbnail/PreviewCard";
import { useRef, useState } from "react";

type DeviceType = "website" | "mobile";

export default function ThumbnailPage() {
  const [screenCount, setScreenCount] = useState(4);
  const [deviceType, setDeviceType] = useState<DeviceType>("website");
  const [rotation, setRotation] = useState(15);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load html2canvas from CDN when needed to avoid bundler resolving issues in certain environments
  type Html2CanvasType = (
    el: HTMLElement,
    options?: { backgroundColor?: string; scale?: number },
  ) => Promise<HTMLCanvasElement>;

  const loadHtml2Canvas = async () => {
    if (typeof window === "undefined")
      throw new Error("html2canvas requires a browser environment");

    const w = window as Window & { html2canvas?: Html2CanvasType };
    if (w.html2canvas) return w.html2canvas;

    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load html2canvas from CDN"));
      document.body.appendChild(s);
    });

    if (!w.html2canvas) throw new Error("html2canvas not available after loading script");
    return w.html2canvas;
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      const html2canvas = await loadHtml2Canvas();
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
