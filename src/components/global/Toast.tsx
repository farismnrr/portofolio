import { useEffect } from "react";
import styles from "./Toast.module.scss";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type = "info", onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastIcon}>
        {type === "success" && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <title>Success</title>
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {type === "error" && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <title>Error</title>
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {type === "info" && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <title>Info</title>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 16v-4M12 8h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <p>{message}</p>
      <button
        type="button"
        className={styles.toastClose}
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};
