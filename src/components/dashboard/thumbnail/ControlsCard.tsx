import { useUI } from "@/context/UIContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiDownload } from "react-icons/fi";
import styles from "./ControlsCard.module.scss";
import { MAX_COLS_MOBILE, MAX_COLS_WEB } from "./constants";

type DeviceType = "website" | "mobile";

interface ControlsCardProps {
  screenCount: number;
  setScreenCount: (value: number) => void;
  deviceType: DeviceType;
  setDeviceType: (value: DeviceType) => void;
  rotation: number;
  setRotation: (value: number) => void;
  onExport: () => void;
  screenImages: Record<number, string>;
  setScreenImages: (v: (prev: Record<number, string>) => Record<number, string>) => void;
}

export const ControlsCard = ({
  screenCount,
  setScreenCount,
  deviceType,
  setDeviceType,
  rotation,
  setRotation,
  onExport,
  screenImages,
  setScreenImages,
}: ControlsCardProps) => {
  const { showToast, showModal, hideModal } = useUI();
  const [isExporting, setIsExporting] = useState(false);

  // Auto-reset rotation if screenCount is below maxCols
  useEffect(() => {
    const maxCols = deviceType === "website" ? MAX_COLS_WEB : MAX_COLS_MOBILE;
    if (screenCount < maxCols && rotation !== 0) {
      setRotation(0);
    }
  }, [screenCount, deviceType, rotation, setRotation]);

  const handleFile = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be less than 10MB", "error");
      return;
    }

    const m = file.name.match(/^\s*(\d+)/);
    if (!m) {
      showToast('Filename must start with screen number (e.g., "1.png")', "error");
      return;
    }
    const idx = Number(m[1]);
    if (!Number.isFinite(idx) || idx < 1) {
      showToast("Invalid screen number in filename", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setScreenImages((s) => {
      const prev = s[idx];
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return { ...s, [idx]: url };
    });
    showToast(`Screen ${idx} uploaded successfully`, "success");
  };

  // Dropzone state + hidden file input ref
  const [dragActive, setDragActive] = useState(false);
  const [isUploadedModalOpen, setIsUploadedModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer?.files;
    if (files) {
      for (const f of files) handleFile(f);
    }

    // auto-close the dropzone after drop
    setDragActive(false);
  };

  const handleFilesFromInput = (files?: FileList | null) => {
    if (!files) return;
    for (const f of files) handleFile(f);
    setDragActive(false);
  };

  const openUploadedModal = useCallback(() => {
    showModal(
      "Uploaded Images",
      <div className={styles.uploadedList}>
        <ul>
          {Object.entries(screenImages).map(([k, v]) => (
            <li key={k}>
              <span>Screen {k}</span>
              <button
                type="button"
                className={styles.removeX}
                onClick={() => {
                  URL.revokeObjectURL(v);
                  setScreenImages((s) => {
                    const t = { ...s };
                    delete t[Number(k)];
                    return t;
                  });
                  showToast(`Screen ${k} removed`, "info");
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>,
      () => setIsUploadedModalOpen(false),
    );
  }, [screenImages, setScreenImages, showModal, showToast]);

  // Keep modal content fresh when screenImages change
  useEffect(() => {
    if (isUploadedModalOpen) {
      if (Object.keys(screenImages).length === 0) {
        setIsUploadedModalOpen(false);
        hideModal();
      } else {
        openUploadedModal();
      }
    }
  }, [screenImages, isUploadedModalOpen, openUploadedModal, hideModal]);

  const handleOpenModal = () => {
    setIsUploadedModalOpen(true);
  };

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

      {screenCount >= (deviceType === "website" ? MAX_COLS_WEB : MAX_COLS_MOBILE) && (
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
      )}

      <div className={styles.inlineDropContainer}>
        {/* biome-ignore lint/a11y/useSemanticElements: nested buttons are invalid HTML, so we use a div with role="button" */}
        <div
          role="button"
          tabIndex={0}
          className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("thumbnail-upload")?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("thumbnail-upload")?.click();
            }
          }}
          style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
        >
          <div className={styles.dropIcon} aria-hidden="true">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Upload</title>
              <path
                d="M12 3v12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 7l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 15v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.dropText}>
            <strong>Drag & drop your image files here</strong>

            <div className={styles.dropSubtitle}>Upload your image files (.jpg, .png, .webp)</div>

            <div className={styles.centerRow}>
              <button
                type="button"
                className={styles.chooseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Files
              </button>
            </div>

            <div className={styles.fileChips}>
              <span className={styles.chip}>.jpg</span>
              <span className={styles.chip}>.png</span>
              <span className={styles.chip}>.webp</span>
            </div>

            <small className={styles.hint}>Max 10 MB each</small>
          </div>
          <input
            ref={fileInputRef}
            id="thumbnail-upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              handleFilesFromInput(e.target.files);
              (e.currentTarget as HTMLInputElement).value = "";
            }}
          />
        </div>
      </div>

      {Object.keys(screenImages).length > 0 && (
        <div>
          <button type="button" className={styles.uploadSummary} onClick={handleOpenModal}>
            Uploaded: {Object.keys(screenImages).length}
          </button>
        </div>
      )}

      <button
        type="button"
        className={styles.exportBtn}
        onClick={async () => {
          setIsExporting(true);
          try {
            await onExport();
            showToast("Thumbnail exported successfully!", "success");
          } catch (_error) {
            showToast("Failed to export thumbnail", "error");
          } finally {
            setIsExporting(false);
          }
        }}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <div className={styles.spinner} />
            Exporting...
          </>
        ) : (
          <>
            <FiDownload />
            Export Thumbnail
          </>
        )}
      </button>
    </section>
  );
};
