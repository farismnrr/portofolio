import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Mockup } from "./Mockup";
import styles from "./PreviewCard.module.scss";

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

        const margin = 8; // safety margin in pixels to avoid touching edges
        const availableWidth = canvasRect.width - margin * 2;
        const availableHeight = canvasRect.height - margin * 2;
        const scale = Math.min(1, availableWidth / rect.width, availableHeight / rect.height);

        // Compute fixed-spacing positions in pixel coordinates (tighter)
        const gap = 12; // fixed gap in pixels
        const itemW = deviceType === "website" ? 560 : 220;
        // approximate heights
        const itemH =
          deviceType === "website" ? 40 + itemW * (10 / 16) + 2 : 24 + itemW * (19.5 / 9) + 4;

        const cols = Math.max(1, Math.floor((availableWidth + gap) / (itemW + gap)));
        const rows = Math.ceil(screenCount / cols);

        const totalW = cols * itemW + (cols - 1) * gap;
        const totalH = rows * itemH + (rows - 1) * gap;

        const newPositions: Array<{ top: number; left: number }> = [];
        for (let i = 0; i < screenCount; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const left = margin + (availableWidth - totalW) / 2 + c * (itemW + gap) + itemW / 2;
          const top = margin + (availableHeight - totalH) / 2 + r * (itemH + gap) + itemH / 2;
          newPositions.push({ top, left });
        }

        setPositions(newPositions);
        setFitScale(scale);

        // Apply final transform (rotation + fitScale)
        inner.style.transform = `rotate(${rotation}deg) scale(${scale})`;
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
                  <Mockup deviceType={deviceType} totalScreens={screenCount} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
