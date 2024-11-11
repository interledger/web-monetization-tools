import { useForm, SubmitHandler } from 'react-hook-form';

import { cn } from "../lib/cn";
import { useEffect, useState } from "react";
import Quote from "./quote";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/form/form";
import { AmountDisplay, DialPad } from "../components/dialpad";
import { PresetPad } from "../components/presets";
import { useQuoteContext } from "../lib/context/quote";
import { useDialPadContext } from "../lib/context/dialpad";
import { setCookie } from "../utils/helpers"

import {
  formatAmount,
  FormattedAmount,
  predefinedPaymentValues,
  sanitizeAndAddCss,
} from "../utils/helpers";

import useDataLoader, { formProps, LoaderDataProps } from '../lib/dataLoader';
import { Loader } from './loader';
import { useBackdropContext } from '../lib/context/backdrop';


// const schema = z.object({
//   walletAddress: z.string(),
//   receiver: z
//     .string()
//     .transform((val: string) => val.replace("$", "https://"))
//     .pipe(z.string().url({ message: "The input is not a wallet address." })),
//   amount: z.coerce
//     .number()
//     .positive({ message: "The amount has to be a positive number." }),
//   note: z.string().optional(),
//   action: z.string().optional(),
//   css: z.string().optional(),
//   value: z.string().optional(),
//   intent:  z.string().optional()
// })



export type OpenPaymentsProps = {
  type: string;
  walletAddress: string;
}

export const OpenPayments = (props: OpenPaymentsProps) => {

  let dataReceived: LoaderDataProps = {
    receiverWalletAddress: props.walletAddress,
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
  const [data, setData] = useState<LoaderDataProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { amountValue, setAmountValue, setAssetCode } = useDialPadContext();
  const { open, setOpen } = useQuoteContext();
  const { isLoading, setIsLoading } = useBackdropContext();
  const [displayDialPad, setDisplayDialPad] = useState(false);
  const [displayPresets, setDisplayPresets] = useState(true);
  const [formData, setFormData] = useState<LoaderDataProps | null>(null); // State to hold fetched data
  const {register, handleSubmit, control,formState: { isSubmitting} } = useForm({
    defaultValues: {
      walletAddress: '',
      receiver: '',
      note: '',
      amount: '',
      action: '',
      css: ''
    }
  })

  const onClose = () => {
    console.log('onClose')
    setOpen(false);
  }

  const onSubmit: SubmitHandler<formProps> = async (formData) => {
    try {
      console.log("onSubmit: SubmitHandler<formProps> ",formData);
      setLoading(true)
      setIsLoading(true)
      setError(null)

      dataReceived = await useDataLoader<LoaderDataProps>({
        ...formData,
        receiver: props.walletAddress,
        amount: amountValue,
      });
      setFormData({
        ...dataReceived,
        isValidRequest: true,
        isQuote: true
      });

      setIsLoading(false)
    } catch (error) {
      console.error('There was an error submitting the form:', error);
      alert('Error submitting form');
    }
    
    const quote = dataReceived?.quote ? JSON.stringify(dataReceived.quote) : ''
    console.log("JSON.stringify(dataReceived?.quote)",quote)
   
    setCookie(
      "ilpay_browser", quote,5,"/","",true,false,"Lax"
    )
    const wA = dataReceived?.walletAddress ? JSON.stringify(dataReceived.walletAddress) : ''
    setCookie(
      "ilpay_wA", wA,50,"/","",true,false,"Lax"
    )
  };


  useEffect(() => {
    if(formData) {
      console.log("data useEffect. ",data)
      console.log("dataReceived useEffect. ",formData)

      setAssetCode(data ? data?.currency : 'usd');
      const formattedNumber = Number(data?.amount?.amount || 0).toFixed(data?.assetScale);
      setAmountValue(String(formattedNumber));
  
  
      formData?.isQuote ? setOpen(true) : setOpen(false);

    } else {
      setIsLoading(false)
    }

  }, [formData, setData, setOpen, setIsLoading]);

  return (
    <>
      <div className="flex flex-col justify-center gap-10">
        <Loader type="small" />
        {!open && 
        <div>
            <div
              className={cn(
                "mx-auto w-full max-w-sm flex flex-col justify-center items-center text-muted",
                displayDialPad ? "" : "hidden"
              )}
            >
              {displayDialPad && <DialPad />}
              <div className="flex flex-col gap-2">
                <div className="flex justify-center mt-8">
                  <Button
                    className="wmt-formattable-button"
                    aria-label="continue"
                    value="continue"
                    onClick={() => {
                      const formattedNumber = Number(amountValue).toFixed(
                        data?.assetScale
                      );
                      setAmountValue(String(formattedNumber));
                      setDisplayDialPad(false);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "mx-auto w-full max-w-sm",
                displayDialPad ? "hidden" : ""
              )}
            >
              <div onClick={() => setDisplayPresets(!displayPresets)}>
                <AmountDisplay />
              </div>
              <div
                className={cn(
                  "mx-auto w-full max-w-sm my-6",
                  !displayPresets && "hidden"
                )}
              >
                <PresetPad
                  values={predefinedPaymentValues}
                  currency={data ? data.amount.symbol : '$'}
                  onMore={() => setDisplayDialPad(true)}
                />
              </div>
              <form 
                method="post"  
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-2">
                  <Field
                    type="text"
                    label="Pay from"
                    placeholder="Enter wallet address"
                    
                    // {...conform.input(fields.walletAddress)}
                    // key={fields.walletAddress.key}
                    // name={fields.walletAddress.name}
                    // errors={fields.walletAddress.errors}
                    {...register('walletAddress')}

                  />
                  <Field
                    type="text"
                    label="Pay into"
                    variant="highlight"
                    value={props.walletAddress}
                    readOnly
                    compact
                    // {...conform.input(fields.receiver)}
                    // key={fields.receiver.key}
                    // name={fields.receiver.name}
                    // errors={fields.receiver.errors}
                    {...register('receiver')}
                  />
                  <Field
                    label="Payment note"
                    defaultValue={data?.note || ""}
                    placeholder="Note"
                    compact
                    // {...conform.input(fields.note)}
                    // key={fields.note.key}
                    // name={fields.note.name}
                    // errors={fields.note.errors}
                    {...register('note')}
                  />
                  <input
                    type="hidden"
                    // {...conform.input(fields.amount)}
                    // key={fields.amount.key}
                    // name={fields.amount.name}
                    // defaultValue={Number(amountValue || 0)}

                    {...register('amount')}
                  />
                  <div className="flex justify-center mt-2">
                    <Button
                      className={cn(
                        "wmt-formattable-button disabled:pointer-events-auto",
                        isSubmitting && "disabled:cursor-progress" 
                      )}
                      aria-label="pay"
                      type="submit"
                      name="intent"
                      value="pay"
                      disabled={isSubmitting || Number(amountValue) === 0}
                    >
                      {data?.action || "Pay"}
                    </Button>
                    <input
                      type="hidden"
                      // {...conform.input(fields.action)}
                      // key={fields.action.key}
                      // name={fields.action.name}
                      // defaultValue={data.action}
                      {...register('action')}
                    />
                    <input
                      type="hidden"
                      // {...conform.input(fields.css)}
                      // key={fields.css.key}
                      // name={fields.css.name}
                      // defaultValue={data.encodedCss}
                      {...register('css')}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          }
          <Quote
            receiverName={formData ? formData.receiverName : ""}
            receiveAmount={formData?.receiveAmount || ""}
            debitAmount={formData?.debitAmount || ""}
            walletAddress={formData?.walletAddress || ""}
            quoteData={formData?.quote || ""}
          />
      </div>
    </>
  );
} 