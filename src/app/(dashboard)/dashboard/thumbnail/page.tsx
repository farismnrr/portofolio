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

  // Load html-to-image from CDN when needed
  interface HtmlToImage {
    toPng: (el: HTMLElement, options?: Record<string, unknown>) => Promise<string>;
  }

  const loadHtmlToImage = async (): Promise<HtmlToImage> => {
    if (typeof window === "undefined")
      throw new Error("html-to-image requires a browser environment");

    const w = window as Window & { htmlToImage?: HtmlToImage };
    if (w.htmlToImage) return w.htmlToImage;

    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load html-to-image from CDN"));
      document.body.appendChild(s);
    });

    if (!w.htmlToImage) throw new Error("html-to-image not available after loading script");
    return w.htmlToImage;
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      const htmlToImage = await loadHtmlToImage();
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        backgroundColor: "transparent",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
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
