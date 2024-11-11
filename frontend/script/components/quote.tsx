import { Transition } from "@headlessui/react";
import { Fragment } from "react/jsx-runtime";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";


import { useQuoteContext } from "../lib/context/quote";
import { Field } from "./ui/form/form";
import { Button } from "./ui/button";

import { getInitPayment, LoaderDataProps } from "../lib/dataLoader";
import { useBackdropContext } from "../lib/context/backdrop";
import { Header } from "./header";
import { getCookie } from "../utils/helpers";



export type QuoteArgs = {
  receiverName: string;
  receiveAmount: string;
  debitAmount: string;
  walletAddress: {}
  quoteData: {}
};

export default function Quote({
  receiverName,
  receiveAmount,
  debitAmount,
  walletAddress,
  quoteData
}: QuoteArgs) {
  const { open, setOpen } = useQuoteContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {register, handleSubmit, control,formState: { isSubmitting} } = useForm({
    defaultValues: {
      debitAmount: debitAmount,
      receiveAmount: receiveAmount,
      intent: 'confirm'
    }
  });
  const { isLoading, setIsLoading } = useBackdropContext();


  type quoteProps = {
    debitAmount: string,
    receiveAmount: string,
  }
  let dataReceived: LoaderDataProps = {
    receiverWalletAddress: '',
    isValidRequest: true,
    note: '',
    amount: {
      amount: 0,
      symbol: '$',
      amountWithCurrency: '$0'
    },
    currency: 'USD',
    receiverName: '',
    isQuote: false,
    assetScale: 2,
    action: 'pay',
    css: ''
  }
  const handleQuote: SubmitHandler<quoteProps> = async (formData) => {
    setLoading(true);
    setError(null);

    // const quote  = getCookie("ilpay_browser") || ''
    // const wA  = getCookie("ilpay_wA") || ''

    const data = JSON.stringify({
      quote: quoteData,
      walletAddress: walletAddress,
      redirectUrl: window.location.href
    })

    dataReceived = await getInitPayment(data);

  }

  useEffect(() => {
    setIsLoading(false)
  }, []);

  // if (receiverName !== "") {
  //   setIsLoading(false);
  // }

  return (
    <Transition.Root show={open} as={Fragment}>
      <div className="flex h-full flex-col justify-center gap-10 pt-5">
        <div className="mx-auto w-full max-w-sm">
          <Header />
          <form method="POST" className="pt-5" onSubmit={handleSubmit(handleQuote)} >
            <Field
              label="You send:"
              variant="highlight"
              value={debitAmount}
              readOnly
              {...register('debitAmount')}
            ></Field>
            <Field
              label={`${receiverName} receives (approximately): `}
              variant="highlight"
              value={receiveAmount}
              readOnly
              {...register('receiveAmount')}
            ></Field>
            <div className="flex justify-center items-center gap-3">
              <Button
                aria-label="confirm-pay"
                type="submit"
                value="confirm"
                {...register('intent')}
                disabled={loading}
              >
                Confirm payment
              </Button>
              <Button
                aria-label="cancel-pay"
                type="submit"
                variant="destructive"
                value="cancel"
                {...register('intent')}
                disabled={loading}
                onClick={() => {
                  //setOpen(false)
                  console.log('cancel quote')
                }}
              >
                Cancel payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Transition.Root>
  )
}
