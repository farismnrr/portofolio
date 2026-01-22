import styles from "./Mockup.module.scss";

type DeviceType = "website" | "mobile";

interface MockupProps {
  deviceType: DeviceType;
  totalScreens: number;
  /** Optional override to force a specific scale regardless of totalScreens */
  scaleOverride?: number;
}

export const Mockup = ({ deviceType, totalScreens, scaleOverride }: MockupProps) => {
  // Adjust scale based on device type
  const isMobile = deviceType === "mobile";

  // Adaptive scale: Hero mode for single screen, Grid mode for multiple.
  const isSingle = totalScreens === 1;

  let scale: number;
  if (typeof scaleOverride === "number") {
    scale = scaleOverride;
  } else if (isMobile) {
    scale = isSingle ? 0.85 : 0.75;
  } else {
    // Web: 0.55 for hero detail, 0.3 to fit 4 in a row (soldiers).
    scale = isSingle ? 0.55 : 0.3;
  }

  return (
    <div
      className={`${styles.mockup} ${styles[deviceType]}`}
      style={{
        transform: `scale(${scale})`,
        // Grid handles positioning, scale handles size.
      }}
    >
      {deviceType === "website" ? (
        <div className={styles.browserFrame}>
          <div className={styles.browserHeader}>
            <div className={styles.browserDots}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.browserUrl}>portfolio-showcase.com</div>
          </div>
          <div className={styles.greenScreen} />
        </div>
      ) : (
        <div className={styles.phoneFrame}>
          <div className={styles.phoneNotch} />
          <div className={styles.greenScreen} />
          <div className={styles.phoneHomeIndicator} />
        </div>
      )}
    </div>
  );
};
