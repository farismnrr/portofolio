import Image from "next/image";
import styles from "./MonitorMockup.module.scss";

interface MonitorMockupProps {
  imageSrc?: string;
}

export const MonitorMockup = ({ imageSrc }: MonitorMockupProps) => {
  return (
    <div className={styles.monitorContainer}>
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
