import {
  type AuthenticatedClient,
  PendingGrant,
  //type PendingGrant,
  type Quote,
  type WalletAddress,
  createAuthenticatedClient,
  //isFinalizedGrant,
  isPendingGrant,
} from "@interledger/open-payments";
import { createId } from "@paralleldrive/cuid2";
import { randomUUID } from "crypto";

async function createClient() {
  return await createAuthenticatedClient({
    keyId: process.env.KEY_ID!,
    privateKey: Buffer.from(process.env.PRIVATE_KEY!, "base64"),
    walletAddressUrl: process.env.WALLET_ADDRESS!,
  });
}
export async function getValidWalletAddress(walletAddress: string) {
  const opClient = await createClient();
  const response = await getWalletAddress(walletAddress, opClient);
  return response;
}

type QuoteResponse = Quote & { incomingPaymentGrantToken: string };

type QuoteGrantParams = {
  authServer: string;
  opClient: AuthenticatedClient;
};

type CreateIncomingPaymentParams = {
  accessToken: string;
  walletAddress: WalletAddress;
  note: string;
  opClient: AuthenticatedClient;
};


export async function fetchQuote(
  args: {
    walletAddress: string;
    receiver: string;
    amount: number;
    note?: string;
  },
  receiver: WalletAddress
): Promise<QuoteResponse> {
  const opClient = await createClient();
  const walletAddress = await getWalletAddress(args.walletAddress, opClient);

  const amountObj = {
    value: BigInt(
      (args.amount * 10 ** walletAddress.assetScale).toFixed()
    ).toString(),
    assetCode: walletAddress.assetCode,
    assetScale: walletAddress.assetScale,
  };
  
  console.log('process.env.WALLET_ADDRESS ',process.env.WALLET_ADDRESS)
  console.log('opClient',opClient)
  console.log('amountObj',amountObj)
  const incomingPaymentGrant = await getIncomingPaymentGrant(
    receiver.authServer,
    opClient
  );

  // create incoming payment without incoming amount
  const incomingPayment = await createIncomingPayment({
    accessToken: incomingPaymentGrant.access_token.value,
    walletAddress: receiver,
    note: args.note || "",
    opClient,
  });

  const quoteGrant = await getQuoteGrant({
    authServer: walletAddress.authServer,
    opClient: opClient,
  });

  if (isPendingGrant(quoteGrant)) {
    throw new Error("Expected non-interactive grant");
  }

  // create quote with debit amount, you don't care how much money receiver gets
  const quote = await opClient.quote
    .create(
      {
        url: new URL(walletAddress.id).origin,
        accessToken: quoteGrant.access_token.value,
      },
      {
        method: "ilp",
        walletAddress: walletAddress.id,
        receiver: incomingPayment.id,
        debitAmount: amountObj,
      }
    )
    .catch(() => {
      throw new Error(
        `Could not create quote for receiver ${receiver.publicName}.`,
      );
    });

  const response = {
    incomingPaymentGrantToken: incomingPaymentGrant.access_token.value,
    ...quote,
  };

  return response;
}


export async function getWalletAddress(
  url: string,
  opClient?: AuthenticatedClient
) {
  opClient = opClient ? opClient : await createClient();
  const walletAddress = await opClient.walletAddress
    .get({
      url: url,
    })
    .catch(() => {
      throw new Error("Invalid wallet address.");
    });

  return walletAddress;
}


async function getIncomingPaymentGrant(
  url: string,
  opClient: AuthenticatedClient
) {
  console.log("await opClient.grant.request",{
    url: url,
  },
  {
    access_token: {
      access: [
        {
          type: "incoming-payment",
          actions: ["read", "create", "complete"],
        },
      ],
    },
  })
  const nonInteractiveGrant = await opClient.grant.request(
    {
      url: url,
    },
    {
      access_token: {
        access: [
          {
            type: "incoming-payment",
            actions: ["read", "create", "complete"],
          },
        ],
      },
    }
  );

  if (isPendingGrant(nonInteractiveGrant)) {
    throw new Error("Expected non-interactive grant");
  }

  return nonInteractiveGrant;
}


async function createIncomingPayment({
  accessToken,
  walletAddress,
  note,
  opClient,
}: CreateIncomingPaymentParams) {
  // create incoming payment without amount
  return await opClient.incomingPayment
    .create(
      {
        url: new URL(walletAddress.id).origin,
        accessToken: accessToken,
      },
      {
        expiresAt: new Date(Date.now() + 6000 * 60).toISOString(),
        walletAddress: walletAddress.id,
        metadata: {
          description: note,
        },
      }
    )
    .catch(() => {
      throw new Error("Unable to create incoming payment.");
    });
}


async function getQuoteGrant({ authServer, opClient }: QuoteGrantParams) {
  return await opClient.grant
    .request(
      {
        url: authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"],
            },
          ],
        },
      }
    )
    .catch(() => {
      throw new Error("Could not retrieve quote grant.");
    });
}

export interface Amount {
  value: string;
  assetCode: string;
  assetScale: number;
}
type CreateOutgoingPaymentParams = {
  walletAddress: WalletAddress;
  debitAmount?: Amount;
  receiveAmount?: Amount;
  nonce?: string;
  paymentId: string;
  opClient: AuthenticatedClient;
  redirectUrl: string
};

async function createOutgoingPaymentGrant(
  params: CreateOutgoingPaymentParams
): Promise<PendingGrant> {
  const {
    walletAddress,
    debitAmount,
    receiveAmount,
    nonce,
    paymentId,
    opClient,
    redirectUrl
  } = params;

  const grant = await opClient.grant
    .request(
      {
        url: walletAddress.authServer,
      },
      {
        access_token: {
          access: [
            {
              identifier: walletAddress.id,
              type: "outgoing-payment",
              actions: ["create", "read", "list"],
              limits: {
                debitAmount: debitAmount,
                receiveAmount: receiveAmount,
              },
            },
          ],
        },
        interact: {
          start: ["redirect"],
          finish: {
            method: "redirect",
            uri: `${redirectUrl}?paymentId=${paymentId}`,
            nonce: nonce || "",
          },
        },
      }
    )
    .catch(() => {
      throw new Error("Could not retrieve outgoing payment grant.");
    });

  if (!isPendingGrant(grant)) {
    throw new Error("Expected interactive outgoing payment grant.");
  }

  return grant;
}

export async function getOutgoingPaymentGrant(args: {
  walletAddress: string;
  quote: Quote;
  redirectUrl: string
}) {
  const opClient = await createClient();
  const walletAddress = await getWalletAddress(args.walletAddress, opClient);
  const clientNonce = randomUUID();
  const paymentId = createId();

  const outgoingPaymentGrant = await createOutgoingPaymentGrant({
    walletAddress: walletAddress,
    debitAmount: args.quote.debitAmount,
    receiveAmount: args.quote.receiveAmount,
    nonce: clientNonce,
    paymentId: paymentId,
    opClient,
    redirectUrl: args.redirectUrl
  });
  return outgoingPaymentGrant;
}