import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Mockup } from "./Mockup";
import styles from "./PreviewCard.module.scss";
// Global layout settings (tweak these values to adjust spacing)
const CANVAS_MARGIN = 12; // px (left/right/top/bottom)
const GAP_HORIZONTAL = 120; // px (horizontal space between screens)
const GAP_VERTICAL = 56; // px (vertical space between rows)

type DeviceType = "website" | "mobile";

interface PreviewCardProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  screenCount: number;
  deviceType: DeviceType;
  rotation: number;
}

export const PreviewCard = ({ canvasRef, screenCount, deviceType, rotation }: PreviewCardProps) => {
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
        const gap = GAP_HORIZONTAL; // fixed gap in pixels (horizontal)
        const itemW = deviceType === "website" ? 620 : 240;
        // approximate heights (unscaled)
        const itemH =
          deviceType === "website" ? 40 + itemW * (10 / 16) + 2 : 24 + itemW * (19.5 / 9) + 4;

        // Use a fixed mockup scale so sizes don't change when rotating or changing count
        const mockupScale = deviceType === "website" ? 0.5 : 0.85;
        const itemWScaled = itemW * mockupScale;
        const itemHScaled = itemH * mockupScale;

        // Force 4 columns when possible and allow horizontal overflow by centering the full layout
        const cols =
          screenCount >= 4
            ? 4
            : Math.max(1, Math.floor((availableWidth + gap) / (itemWScaled + gap)));
        const rows = Math.ceil(screenCount / cols);

        // Compute horizontal total using the horizontal gap (unchanged)
        const totalW = cols * itemWScaled + (cols - 1) * gap;

        // Use a fixed vertical gap so vertical spacing does not change when screenCount changes
        const verticalGap = GAP_VERTICAL; // px

        const totalH = rows * itemHScaled + (rows - 1) * verticalGap;

        // Center horizontally (allow overflow), vertically center relative to availableHeight
        const leftEdge = (canvasRect.width - totalW) / 2;
        const topStart = margin + (availableHeight - totalH) / 2;

        const newPositions: Array<{ top: number; left: number }> = [];
        for (let i = 0; i < screenCount; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const left = leftEdge + c * (itemWScaled + gap) + itemWScaled / 2;
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
                  <Mockup
                    deviceType={deviceType}
                    totalScreens={screenCount}
                    scaleOverride={deviceType === "website" ? 0.5 : 0.6}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
