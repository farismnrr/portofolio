import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Mockup } from "./Mockup";
import { MonitorMockup } from "./MonitorMockup";
import styles from "./PreviewCard.module.scss";
import { MAX_COLS_MOBILE, MAX_COLS_WEB } from "./constants";

const CANVAS_MARGIN = 12; // px (left/right/top/bottom)
// Per-device horizontal/vertical gaps
const GAP_HORIZONTAL_WEB = 120;
const GAP_HORIZONTAL_MOBILE = 10;
const GAP_VERTICAL_WEB = 80;
const GAP_VERTICAL_MOBILE = -50;

// Per-device screen base widths (used for layout math)
const SCREEN_WIDTH_WEB = 800; // synced with Mockup.module.scss
const SCREEN_WIDTH_MOBILE = 300; // synced with Mockup.module.scss

// Define standard dual monitor size
const MONITOR_DUAL_WIDTH = 1240;
const MONITOR_DUAL_HEIGHT = 600;

type DeviceType = "website" | "mobile";

interface PreviewCardProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  screenCount: number;
  deviceType: DeviceType;
  rotation: number;
  screenImages?: Record<number, string>;
}

export const PreviewCard = ({
  canvasRef,
  screenCount,
  deviceType,
  rotation,
  screenImages,
}: PreviewCardProps) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [positions, setPositions] = useState<Array<{ top: number; left: number }>>([]);
  const [contentBounds, setContentBounds] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateFit = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use rAF to ensure the browser applied the transform
      requestAnimationFrame(() => {
        const canvasRect = canvas.getBoundingClientRect();
        if (canvasRect.width === 0 || canvasRect.height === 0) return;

        const margin = CANVAS_MARGIN;
        const availableWidth = canvasRect.width - margin * 2;
        const availableHeight = canvasRect.height - margin * 2;

        const gap = deviceType === "website" ? GAP_HORIZONTAL_WEB : GAP_HORIZONTAL_MOBILE;
        const baseItemW = deviceType === "website" ? SCREEN_WIDTH_WEB : SCREEN_WIDTH_MOBILE;

        let itemW: number;
        if (
          screenCount < (deviceType === "website" ? MAX_COLS_WEB : MAX_COLS_MOBILE) &&
          screenCount > 0
        ) {
          const candidate = Math.floor((availableWidth - (screenCount - 1) * gap) / screenCount);
          const minAllowed = Math.floor(baseItemW * 0.4);
          const maxAllowed = Math.floor(baseItemW * 1.6);
          itemW = Math.max(minAllowed, Math.min(candidate, maxAllowed));
        } else {
          itemW = baseItemW;
        }

        const itemH =
          deviceType === "website" ? 40 + itemW * (10 / 16) + 2 : 24 + itemW * (19.5 / 9) + 4;

        const mockupScale = deviceType === "website" ? 0.5 : 0.85;
        const maxCols = deviceType === "website" ? MAX_COLS_WEB : MAX_COLS_MOBILE;

        let appliedScale = mockupScale;
        if (screenCount < maxCols && screenCount > 0) {
          const targetScale = Math.max(
            0.01,
            (availableWidth - (screenCount - 1) * gap) / (screenCount * itemW),
          );
          const t = maxCols <= 1 ? 0 : Math.min(1, (screenCount - 1) / (maxCols - 1));
          const blended = (1 - t) * targetScale + t * mockupScale;
          appliedScale = Math.max(mockupScale, Math.min(1, blended));
        }

        const itemWScaled = itemW * appliedScale;
        const itemHScaled = itemH * appliedScale;
        const cols = screenCount >= maxCols ? maxCols : Math.max(1, screenCount);
        const rows = Math.ceil(screenCount / cols);
        const verticalGap = deviceType === "website" ? GAP_VERTICAL_WEB : GAP_VERTICAL_MOBILE;

        let totalW: number;
        let totalH: number;

        if (deviceType === "website" && screenCount === 2) {
          // Special case for dual monitor bounds
          totalW = MONITOR_DUAL_WIDTH;
          totalH = MONITOR_DUAL_HEIGHT;
        } else {
          totalW = cols * itemWScaled + (cols - 1) * gap;
          totalH = rows * itemHScaled + (rows - 1) * verticalGap;
        }

        setContentBounds({ width: totalW, height: totalH });

        // Calculate fitScale after setting total bounds
        // We need to account for rotation. A simple way is to use the diagonal if rotating,
        // but the previous code used getBoundingClientRect of a transformed inner.
        // Let's do a simplified bounding box calculation for rotation
        const rad = (Math.abs(rotation) * Math.PI) / 180;
        const rotatedW = totalW * Math.cos(rad) + totalH * Math.sin(rad);
        const rotatedH = totalW * Math.sin(rad) + totalH * Math.cos(rad);

        const scale = Math.min(1, availableWidth / rotatedW, availableHeight / rotatedH);
        setFitScale(scale);

        // Center positions within the totalW/totalH area
        const newPositions: Array<{ top: number; left: number }> = [];
        for (let i = 0; i < screenCount; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const left = (c - (cols - 1) / 2) * (itemWScaled + gap) + totalW / 2;
          const top =
            (r + 0.5) * itemHScaled +
            r * verticalGap +
            (totalH - (rows * itemHScaled + (rows - 1) * verticalGap)) / 2;
          newPositions.push({ top, left });
        }
        setPositions(newPositions);
      });
    };

    updateFit();

    // Recompute on resize
    const ro = new ResizeObserver(() => updateFit());
    if (canvasRef.current) ro.observe(canvasRef.current);

    return () => ro.disconnect();
  }, [canvasRef, rotation, screenCount, deviceType]);

  // Generate simple position presets for 1-4 screens, fallback to grid for more
  const _getPositions = (n: number) => {
    if (n === 1) return [{ top: 50, left: 50 }];
    if (n === 2)
      return [
        { top: 50, left: 35 },
        { top: 50, left: 65 },
      ];
    if (n === 3)
      return [
        { top: 30, left: 50 },
        { top: 70, left: 35 },
        { top: 70, left: 65 },
      ];
    if (n === 4)
      return [
        { top: 30, left: 30 },
        { top: 30, left: 70 },
        { top: 70, left: 30 },
        { top: 70, left: 70 },
      ];

    // grid layout for >4
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const positions: Array<{ top: number; left: number }> = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const top = ((r + 0.5) / rows) * 100;
      const left = ((c + 0.5) / cols) * 100;
      positions.push({ top, left });
    }
    return positions;
  };

  return (
    <section className={styles.previewCard}>
      <div className={styles.previewHeader}>Live Preview</div>
      <div ref={canvasRef} className={styles.previewCanvas}>
        <div
          ref={innerRef}
          className={styles.canvasInner}
          style={{
            transform: `rotate(${rotation}deg) scale(${fitScale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            className={styles.mockupsContainer}
            style={{
              width: `${contentBounds.width}px`,
              height: `${contentBounds.height}px`,
            }}
          >
            {deviceType === "website" && screenCount === 2 ? (
              <div className={styles.dualMonitorContainer}>
                <MonitorMockup
                  className={styles.monitorLeft}
                  imageSrc={screenImages ? screenImages[1] : undefined}
                />
                <MonitorMockup
                  className={styles.monitorRight}
                  imageSrc={screenImages ? screenImages[2] : undefined}
                />
              </div>
            ) : (
              Array.from({ length: screenCount }).map((_, index) => {
                const pos = positions[index] || { top: 0, left: 0 };
                return (
                  <div
                    key={`mockup-${screenCount}-${deviceType}-${index}`}
                    className={styles.mockupWrapper}
                    style={{
                      top: `${pos.top}px`,
                      left: `${pos.left}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {deviceType === "website" && screenCount === 1 ? (
                      <div style={{ transform: "scale(0.85)" }}>
                        <MonitorMockup
                          imageSrc={screenImages ? screenImages[index + 1] : undefined}
                        />
                      </div>
                    ) : (
                      <Mockup
                        deviceType={deviceType}
                        totalScreens={screenCount}
                        scaleOverride={deviceType === "website" ? 0.5 : 0.6}
                        imageSrc={screenImages ? screenImages[index + 1] : undefined}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
