import { FiDownload } from "react-icons/fi";
import styles from "./ControlsCard.module.scss";

type DeviceType = "website" | "mobile";

interface ControlsCardProps {
  screenCount: number;
  setScreenCount: (value: number) => void;
  deviceType: DeviceType;
  setDeviceType: (value: DeviceType) => void;
  rotation: number;
  setRotation: (value: number) => void;
  onExport: () => void;
}

export const ControlsCard = ({
  screenCount,
  setScreenCount,
  deviceType,
  setDeviceType,
  rotation,
  setRotation,
  onExport,
}: ControlsCardProps) => {
  return (
    <section className={styles.controlsCard}>
      <div className={styles.controlGroup}>
        <label htmlFor="screenCount">
          Screen Count: <strong>{screenCount}</strong>
        </label>
        <input
          id="screenCount"
          type="range"
          min={1}
          max={20}
          value={screenCount}
          onChange={(e) => setScreenCount(Number(e.target.value))}
        />
      </div>

      <div className={styles.controlGroup}>
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: "0.5rem" }}>Device Type</legend>
          <div className={styles.segmented}>
            <button
              type="button"
              className={deviceType === "website" ? styles.active : ""}
              onClick={() => setDeviceType("website")}
            >
              Website
            </button>
            <button
              type="button"
              className={deviceType === "mobile" ? styles.active : ""}
              onClick={() => setDeviceType("mobile")}
            >
              Mobile
            </button>
          </div>
        </fieldset>
      </div>

      <div className={styles.controlGroup}>
        <label htmlFor="rotation">
          Rotation Angle: <strong>{rotation}°</strong>
        </label>
        <input
          id="rotation"
          type="range"
          min={-45}
          max={45}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
        />
      </div>

      <button type="button" className={styles.exportBtn} onClick={onExport}>
        <FiDownload />
        Export Thumbnail
      </button>
    </section>
  );
};
