
import { WalletAddress } from '@interledger/open-payments/dist/types';
import { formatAmount, FormattedAmount } from '../utils/helpers';
import { decompressCss } from './tdb_decompress_css';

const API_URL = import.meta.env.VITE_EXTERNAL_API_URL

export type formProps = {
  walletAddress: string,
  receiver: string,
  amount: string,
  note?: string,
  action?: string,
  css?: string
  value?: string
}

export async function getValidWalletAddress(walletAddress: string) {
  console.log('BEGIN getValidWalletAddress');
  const response = {
    id: "432432423423",
    publicName: "test wakket",
    assetCode:"usd",
    assetScale: 2,
    authServer: "string;",
    resourceServer: ""
  }
  return response as WalletAddress;
}

export interface LoaderDataProps {
  receiverWalletAddress?: string;
  amount: FormattedAmount; // Adjust type as needed
  currency: string;
  note?: string;
  action?: string;
  isValidRequest: boolean;
  receiveAmount?: string | null;
  debitAmount?: string | null;
  receiverName: string;
  isQuote: string | boolean;
  quote?: {}
  submission?: string;
  assetScale: number;
  encodedCss?: string;
  walletAddress?: {}
  css: string;
}

export async function getInitPayment(data:string ): Promise<LoaderDataProps> {


  try {
    console.log('in getInitPayment')
    const response = await fetch(`${API_URL}op/initializePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
    const result = await response.json();

    console.log("getInitPayment result",result)
    return {
      ...result
     } as LoaderDataProps;

  } catch (error) {
    throw error;
  }
  

}

interface DataLoaderResponse<LoaderDataProps> {
  data: LoaderDataProps;
  loading: boolean;
  error: string | null;
}

 async function useDataLoader<LoaderDataProps>(formData: formProps):  Promise<LoaderDataProps> {
  // console.log('in useDataLoader ')
  // const defaultData = {
  //   receiverWalletAddress: "",
  //   amount: 0.00,
  //   currency: 'USD',
  //   note: "",
  //   action: "",
  //   isValidRequest: true,
  //   receiveAmount: "",
  //   debitAmount: "",
  //   receiverName: "",
  //   isQuote: false,
  //   submission: "",
  //   assetScale: 2,
  //   encodedCss: "",
  //   css: ""
    
  // }
  // let data;
  try {
    console.log('in useDataLoader fetchData ', formData)

    const response = await fetch(`${API_URL}op/getQuote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();

    console.log("result.body",result)

    const receiverName =
      result.receiverWalletAddress.publicName === undefined
        ? "Recepient"
        : result.receiverWalletAddress.publicName;

    const receiveAmount = formatAmount({
      value: result.quote.receiveAmount.value,
      assetCode: result.quote.receiveAmount.assetCode,
      assetScale: result.quote.receiveAmount.assetScale,
    });

    const debitAmount = formatAmount({
      value: result.quote.debitAmount.value,
      assetCode: result.quote.debitAmount.assetCode,
      assetScale: result.quote.debitAmount.assetScale,
    });

    return {
      ...result,
      receiverName ,
      receiveAmount: receiveAmount.amountWithCurrency,
      debitAmount: debitAmount.amountWithCurrency
     } as LoaderDataProps;
  
  } catch (error) {
    throw error;
  }
}


export default useDataLoader;