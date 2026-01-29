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
const SCREEN_WIDTH_WEB = 620; // px
const SCREEN_WIDTH_MOBILE = 240; // px
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

  useLayoutEffect(() => {
    const updateFit = () => {
      const canvas = canvasRef.current;
      const inner = innerRef.current;
      if (!canvas || !inner) return;

      // Temporarily set inner transform to rotation with scale 1 to measure bounding box
      inner.style.transform = `rotate(${rotation}deg) scale(1)`;

      // Use rAF to ensure the browser applied the transform
      requestAnimationFrame(() => {
        const rect = inner.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const margin = CANVAS_MARGIN; // safety margin in pixels to avoid touching edges
        const availableWidth = canvasRect.width - margin * 2;
        const availableHeight = canvasRect.height - margin * 2;
        const _scale = Math.min(1, availableWidth / rect.width, availableHeight / rect.height);

        // Compute fixed-spacing positions in pixel coordinates (more readable)
        const gap = deviceType === "website" ? GAP_HORIZONTAL_WEB : GAP_HORIZONTAL_MOBILE; // horizontal gap per device
        const baseItemW = deviceType === "website" ? SCREEN_WIDTH_WEB : SCREEN_WIDTH_MOBILE;
        // If count is less than maxCols, compute dynamic item width so items start large and shrink as count grows
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
        // approximate heights (unscaled)
        const itemH =
          deviceType === "website" ? 40 + itemW * (10 / 16) + 2 : 24 + itemW * (19.5 / 9) + 4;

        // Use a fixed mockup scale so sizes don't change when rotating or changing count
        const mockupScale = deviceType === "website" ? 0.5 : 0.85;
        // Determine if we should scale up to fill available width when screenCount < maxCols
        const maxCols = deviceType === "website" ? MAX_COLS_WEB : MAX_COLS_MOBILE;

        // If fewer screens than maxCols, compute a target scale to better fill the canvas width
        let appliedScale = mockupScale;
        if (screenCount < maxCols && screenCount > 0) {
          // targetScale uses unscaled itemW so we can grow up to full size (<= 1)
          const targetScale = Math.max(
            0.01,
            (availableWidth - (screenCount - 1) * gap) / (screenCount * itemW),
          );

          // Blend between targetScale (for small counts) and mockupScale (at maxCols)
          const t = maxCols <= 1 ? 0 : Math.min(1, (screenCount - 1) / (maxCols - 1));
          const blended = (1 - t) * targetScale + t * mockupScale;

          // Clamp so we don't exceed natural size and don't go below mockupScale
          appliedScale = Math.max(mockupScale, Math.min(1, blended));
        }

        const itemWScaled = itemW * appliedScale;
        const itemHScaled = itemH * appliedScale;

        // Use per-device maximum columns when forcing fixed columns; when screenCount < maxCols use screenCount columns
        const cols = screenCount >= maxCols ? maxCols : Math.max(1, screenCount);
        const rows = Math.ceil(screenCount / cols);

        // Compute horizontal total using the horizontal gap (unchanged)
        const totalW = cols * itemWScaled + (cols - 1) * gap;

        // Use a fixed vertical gap per device so vertical spacing does not change when screenCount changes
        const verticalGap = deviceType === "website" ? GAP_VERTICAL_WEB : GAP_VERTICAL_MOBILE; // px

        const totalH = rows * itemHScaled + (rows - 1) * verticalGap;

        // Compute vertical centering; horizontal centering will be handled per-item using center-based offsets
        const _leftEdge = (canvasRect.width - totalW) / 2;
        const topStart = margin + (availableHeight - totalH) / 2;

        const newPositions: Array<{ top: number; left: number }> = [];
        for (let i = 0; i < screenCount; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          // Position items symmetrically from the canvas center (grow outwards from center)
          const centerX = canvasRect.width / 2;
          const colOffset = c - (cols - 1) / 2;
          const left = centerX + colOffset * (itemWScaled + gap);
          const top = topStart + r * (itemHScaled + verticalGap) + itemHScaled / 2;
          newPositions.push({ top, left });
        }

        setPositions(newPositions);
        // Keep scale fixed to 1 so size doesn't change on rotate/resize
        setFitScale(1);

        // Apply final transform (rotation only)
        inner.style.transform = `rotate(${rotation}deg) scale(1)`;
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
          <div className={styles.mockupsContainer}>
            {Array.from({ length: screenCount }).map((_, index) => {
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
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
