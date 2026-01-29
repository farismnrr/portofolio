import type React from "react";
import { MonitorMockup } from "./MonitorMockup";
import styles from "./WebsiteSpecialPreview.module.scss";

interface WebsiteSpecialPreviewProps {
  screenCount: number;
  screenImages?: Record<number, string>;
}

export const WebsiteSpecialPreview: React.FC<WebsiteSpecialPreviewProps> = ({
  screenCount,
  screenImages,
}) => {
  if (screenCount === 1) {
    return (
      <div className={styles.singleContainer}>
        <MonitorMockup imageSrc={screenImages ? screenImages[1] : undefined} />
      </div>
    );
  }

  if (screenCount === 2) {
    return (
      <div className={styles.dualContainer}>
        <MonitorMockup
          className={styles.monitorLeft}
          imageSrc={screenImages ? screenImages[1] : undefined}
        />
        <MonitorMockup
          className={styles.monitorRight}
          imageSrc={screenImages ? screenImages[2] : undefined}
        />
      </div>
    );
  }

  if (screenCount === 3) {
    return (
      <div className={styles.tripleContainer}>
        <div className={styles.tripleLayer}>
          <MonitorMockup
            className={styles.monitorBackLeft}
            imageSrc={screenImages ? screenImages[1] : undefined}
          />
          <MonitorMockup
            className={styles.monitorBackRight}
            imageSrc={screenImages ? screenImages[3] : undefined}
          />
          <MonitorMockup
            className={styles.monitorFront}
            imageSrc={screenImages ? screenImages[2] : undefined}
          />
        </div>
      </div>
    );
  }

  return null;
};
