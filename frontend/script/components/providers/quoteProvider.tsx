import { type ReactNode, useState } from "react";
import { QuoteContext } from "../../lib/context/quote";

type QuoteProviderProps = {
  children: ReactNode;
};

export const QuoteProvider = ({ children }: QuoteProviderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <QuoteContext.Provider
      value={{
        open,
        setOpen,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};
QuoteProvider.displayName = "QuoteProvider";
