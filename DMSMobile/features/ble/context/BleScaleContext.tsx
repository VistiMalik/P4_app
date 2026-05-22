import React, { createContext, useContext } from "react";
import { useBleScale } from "../hooks/useBleScale";

type BleScaleContextType = ReturnType<typeof useBleScale>;

const BleScaleContext = createContext<BleScaleContextType | null>(null);

export const BleScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const bleScale = useBleScale();

  return (
    <BleScaleContext.Provider value={bleScale}>
      {children}
    </BleScaleContext.Provider>
  );
};

export const useBleScaleContext = (): BleScaleContextType => {
  const context = useContext(BleScaleContext);
  if (!context) {
    throw new Error("useBleScaleContext must be used within a BleScaleProvider");
  }
  return context;
};
