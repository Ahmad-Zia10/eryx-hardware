"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface EnquiryModalState {
  open: boolean;
  productName: string | null;
  prefilledMessage: string;
  heading: string;
}

interface OpenEnquiryModalOptions {
  productName?: string | null;
  prefilledMessage?: string;
  heading?: string;
}

interface UIContextValue {
  toastVisible: boolean;
  showToast: () => void;
  cartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  enquiryModal: EnquiryModalState;
  openEnquiryModal: (options?: OpenEnquiryModalOptions) => void;
  closeEnquiryModal: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toastVisible, setToastVisible] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [enquiryModal, setEnquiryModal] = useState<EnquiryModalState>({
    open: false,
    productName: null,
    prefilledMessage: "",
    heading: "Enquire About This Product",
  });

  const showToast = useCallback(() => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const openCartDrawer = useCallback(() => setCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  const openEnquiryModal = useCallback(
    ({
      productName = null,
      prefilledMessage = "",
      heading = "Enquire About This Product",
    }: OpenEnquiryModalOptions = {}) => {
      setEnquiryModal({ open: true, productName, prefilledMessage, heading });
    },
    []
  );

  const closeEnquiryModal = useCallback(() => {
    setEnquiryModal((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <UIContext.Provider
      value={{
        toastVisible,
        showToast,
        cartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        enquiryModal,
        openEnquiryModal,
        closeEnquiryModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}