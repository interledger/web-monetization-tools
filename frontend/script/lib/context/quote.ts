import { createContext, useContext } from "react";

type QuoteContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const QuoteContext = createContext<QuoteContextProps | null>(null);

export const useQuoteContext = () => {
  const quoteContext = useContext(QuoteContext);

  if (!quoteContext) {
    throw new Error(
      '"useQuoteContext" is used outside the QuoteContextProvider.'
    );
  }

  return quoteContext;
};
