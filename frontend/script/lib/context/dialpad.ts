import { createContext, useContext } from "react";

type DialPadContextProps = {
  amountValue: string;
  setAmountValue: (amount: string) => void;
  assetCode: string;
  setAssetCode: (assetCode: string) => void;
};

export const DialPadContext = createContext<DialPadContextProps | undefined>(undefined);

export const useDialPadContext = () => {
  const context = useContext(DialPadContext);
  if (!context) {
    throw new Error("useDialPadContext must be used within a DialPadContextProvider");
  }
  return context;
};

