"use client";

import { Modal } from "@/components/global/Modal";
import { Toast } from "@/components/global/Toast";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

interface UIContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showModal: (title: string, children: ReactNode, onClose?: () => void) => void;
  hideModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    children: null,
  });

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showModal = useCallback((title: string, children: ReactNode, onClose?: () => void) => {
    setModal({ isOpen: true, title, children, onClose });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => {
      if (prev.onClose) prev.onClose();
      return { ...prev, isOpen: false };
    });
  }, []);

  return (
    <UIContext.Provider value={{ showToast, showModal, hideModal }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <Toast
              message={t.message}
              type={t.type}
              duration={t.duration}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
      <Modal isOpen={modal.isOpen} onClose={hideModal} title={modal.title}>
        {modal.children}
      </Modal>
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
