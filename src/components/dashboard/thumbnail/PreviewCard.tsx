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

        const scale = Math.min(1, canvasRect.width / rect.width, canvasRect.height / rect.height);

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
  }, [canvasRef, rotation]);

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
            {Array.from({ length: screenCount }).map((_, index) => (
              <Mockup
                key={`mockup-${screenCount}-${deviceType}-${index}`}
                deviceType={deviceType}
                totalScreens={screenCount}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
