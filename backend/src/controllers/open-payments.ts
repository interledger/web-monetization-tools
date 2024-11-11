import type { Request, Response } from 'express'
import { type WalletAddress } from "@interledger/open-payments";
import _ from 'underscore'
import { z, RefinementCtx } from "zod";
import {
  fetchQuote,
  getValidWalletAddress,
  getOutgoingPaymentGrant
} from '../services/open-payments.server'
import { getSession } from "../services/session"

const schema = z.object({
  walletAddress: z.string(),
  receiver: z
    .string()
    .transform((val: string) => val.replace("$", "https://"))
    .pipe(z.string().url({ message: "The input is not a wallet address." })),
  amount: z.coerce
    .number()
    .positive({ message: "The amount has to be a positive number." }),
  note: z.string().optional(),
  action: z.string().optional(),
  css: z.string().optional(),
})

type schemaType = {
  walletAddress: string,
  receiver: string,
  amount: number,
  note?: string,
  action?: string,
  css?: string
}

export const getQuote = async (req: Request, res: Response) => {
  try {
   let sesData: {};
    const data ={
      walletAddress: req.body.walletAddress,
      receiver: "$".concat(req.body.receiver),
      amount: req.body.amount,
      note:  req.body.note
    }
   
    if (!data.walletAddress) {
      throw 'Wallet address is required'
    }



    const cookieValue = req.cookies.ilpaysession;

    const session = await getSession(req);
    req.session = {
      ...req.session,
      'fromExtension': true
    }
    sesData = {
      'fromExtension': true
    }
    //session.fromExtension = true;


    console.log('session value:', session);
    let walletAddress,receiverName,debitAmount;
    let receiver = {} as WalletAddress;

    const formData = data;//await request.formData();
    const intent = 'pay';//formData.get("intent");

    const opSchema = schema.superRefine(async (data: schemaType, context: RefinementCtx) => {
      try {
        data.walletAddress = String(data.walletAddress).replace(
          "$",
          "https://"
        );
        console.log("data.walletAddress", data.walletAddress)
        walletAddress = await getValidWalletAddress(data.walletAddress);
        receiver = await getValidWalletAddress(data.receiver);
        console.log(" validated walletAddress: ", walletAddress)
        // session.set("wallet-address", {
        //   walletAddress: walletAddress,
        // });
        req.session = {
          ...req.session,
          "walletAddress": walletAddress,
          "receiverWalletAddress": receiver
        }
        sesData = {
          ...sesData,
          "walletAddress": walletAddress,
          "receiverWalletAddress": receiver
        }
        return data;
      } catch (error) {
        console.log("super fine exception",error);
        context.addIssue({
          path: ["walletAddress"],
          code: z.ZodIssueCode.custom,
          message: "Wallet address is not valid.",
        });
      }
    })
   
    let resp;
    if (intent === "pay") {

      const submission = await opSchema.parseAsync( formData )
      console.log("submission"); 
      console.log(submission); 

      // if (!submission.value || submission.intent !== "submit") {
      //   return JSON.stringify(submission);
      // }
      console.log("session",req.session);
      console.log("submission",submission);
      console.log("receiver",receiver);
    

      const quote = await fetchQuote(submission, receiver);
      // session.set("quote", quote);
      // session.set("submission", submission);
      req.session = {
        ...req.session,
        "quote": quote,
        "submission": submission
      }
      sesData = {
        ...sesData,
        "quote": quote,
        "submission": submission
      }
      console.log(" req.session", sesData)
      
      res.cookie("ilpay-session", JSON.stringify(quote), {
        maxAge: 300 * 1000, // 300 seconds or 5 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure only in production
        sameSite: "lax", // Ensures the cookie is sent in cross-site requests
      });
    }
    res.status(200).send(req.session)
    } catch (error) {
      console.log(error)
      res.status(500).send('An error occurred when fetching data')
    }

}
export const initializePayment = async (req: Request, res: Response) => {
  try {

    // const quote = req.body.quote;
    // const walletAddress = req.body.walletAddress;
    const { quote, walletAddress, redirectUrl }  = req.body
    console.log("req.body ",req.body)
    if (quote === undefined || walletAddress === undefined) {
      throw new Error("Payment session expired.");
    }
    if (!quote) {
      throw 'Wallet address is required'
    }
    if (!walletAddress) {
      throw 'Wallet address is required'
    }

    const grant = await getOutgoingPaymentGrant({
      walletAddress: walletAddress.id,
      quote,
      redirectUrl
    });
    console.log("grant: ",grant)
    req.session = {
      ...req.session,
      paymentGrant: grant
    }

    // the cookie magic here 
    // return redirect(grant.interact.redirect, {
    //   headers: { "Set-Cookie": commitSession(req.session) },
    // });

    res.status(200).send(req.session)

  } catch (error) {
    console.log(error)
    res.status(500).send('An error occurred when fetching data')
  }

}
export default {
  getQuote,
  initializePayment
}
