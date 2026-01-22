import { useEffect } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      className={styles.modalOverlay}
      open
      onClick={onClose}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") onClose();
      }}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") e.stopPropagation();
        }}
      >
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </dialog>
  );
};
