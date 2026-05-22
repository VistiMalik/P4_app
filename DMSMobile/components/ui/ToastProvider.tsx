import React, { createContext, useCallback, useContext, useState } from "react";
import { Portal, Snackbar } from "react-native-paper";

type ToastContextValue = {
  show: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const onDismiss = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Portal>
        <Snackbar
          visible={Boolean(message)}
          onDismiss={onDismiss}
          duration={3000}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Snackbar>
      </Portal>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro do ToastProvider");
  }

  return context;
};
