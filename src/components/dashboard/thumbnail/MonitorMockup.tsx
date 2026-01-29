import Image from "next/image";
import styles from "./MonitorMockup.module.scss";

interface MonitorMockupProps {
  imageSrc?: string;
  className?: string;
}

export const MonitorMockup = ({ imageSrc, className }: MonitorMockupProps) => {
  return (
    <div className={`${styles.monitorContainer} ${className || ""}`}>
      <div className={styles.monitorFrame}>
        <div className={styles.monitorScreen}>
          <div className={`${styles.greenScreen} ${imageSrc ? styles.withImage : ""}`}>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt="screenshot"
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : null}
          </div>
        </div>
        <div className={styles.monitorBottomBar}>
          <div className={styles.appleLogo} />
        </div>
      </div>
      <div className={styles.monitorStand}>
        <div className={styles.standNeck} />
        <div className={styles.standBase} />
      </div>
    </div>
  );
};
