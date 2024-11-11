import { BrowserRouter } from "react-router-dom";
import { DialPadProvider } from "./components/providers/dialPadProvider";
import { QuoteProvider } from "./components/providers/quoteProvider";
import { BackdropProvider } from './components/providers/backdropProvider';
import { OpenPayments , type OpenPaymentsProps } from "./components/open-payments";

export const OpenPaymentsExtension = ({type,walletAddress}: OpenPaymentsProps) => {
  
  return (
    <QuoteProvider>
      <DialPadProvider>
        <BackdropProvider>
          <BrowserRouter>
            <OpenPayments type={type} walletAddress={walletAddress} />
          </BrowserRouter>
        </BackdropProvider>
      </DialPadProvider>
    </QuoteProvider>
  );
};