import type React from "react";
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
  return (
    <section className={styles.previewCard}>
      <div className={styles.previewHeader}>Live Preview</div>
      <div ref={canvasRef} className={styles.previewCanvas}>
        <div className={styles.mockupsContainer}>
          {Array.from({ length: screenCount }).map((_, index) => (
            <Mockup
              key={`mockup-${screenCount}-${deviceType}-${index}`}
              deviceType={deviceType}
              totalScreens={screenCount}
              rotation={rotation}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
