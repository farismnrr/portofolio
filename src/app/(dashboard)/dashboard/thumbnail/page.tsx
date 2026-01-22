"use client";

import { ControlsCard } from "@/components/dashboard/thumbnail/ControlsCard";
import styles from "@/components/dashboard/thumbnail/Page.module.scss";
import { PreviewCard } from "@/components/dashboard/thumbnail/PreviewCard";
import { useEffect, useRef, useState } from "react";

type DeviceType = "website" | "mobile";

export default function ThumbnailPage() {
  const [screenCount, setScreenCount] = useState(4);
  const [deviceType, setDeviceType] = useState<DeviceType>("website");
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Mapping from 1-based screen number -> image URL (created via URL.createObjectURL)
  const [screenImages, setScreenImages] = useState<Record<number, string>>({});

  // Keep a small ref to detect which URLs were removed/replaced so we can revoke they properly
  const screenImagesRef = useRef<Record<number, string>>({});

  useEffect(() => {
    const prev = screenImagesRef.current;

    // Revoke URLs that were removed or replaced
    for (const [k, v] of Object.entries(prev)) {
      const key = Number(k);
      if (!screenImages[key] || screenImages[key] !== v) {
        URL.revokeObjectURL(v);
      }
    }

    // Update the ref to the latest mapping
    screenImagesRef.current = screenImages;
  }, [screenImages]);

  // On unmount, revoke any remaining object URLs
  useEffect(() => {
    return () => {
      for (const u of Object.values(screenImagesRef.current)) {
        URL.revokeObjectURL(u);
      }
    };
  }, []);

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
      {/* MOBILE WARNING */}
      <div className={styles.mobileWarning}>
        <div className={styles.icon}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Monitor Icon</title>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <h2>Desktop Only Interface</h2>
        <p>
          Thumbnail generator requires a larger screen to provide a precise live preview and export
          quality. Please open this page on a tablet or desktop.
        </p>
      </div>

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
          screenImages={screenImages}
          setScreenImages={setScreenImages}
        />

        {/* RIGHT – PREVIEW */}
        <PreviewCard
          canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
          screenCount={screenCount}
          deviceType={deviceType}
          rotation={rotation}
          screenImages={screenImages}
        />
      </div>
    </div>
  );
}
