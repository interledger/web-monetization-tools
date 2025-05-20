import {
  type PendingGrant,
  type WalletAddress,
  isFinalizedGrant,
  isPendingGrant,
} from '@interledger/open-payments'
// cSpell:ignore keyid
import {
  type AuthenticatedClient,
  createAuthenticatedClient,
} from '@interledger/open-payments/dist/client';
import { createId } from '@paralleldrive/cuid2'
import { toWalletAddressUrl } from './utils.server'
import { createContentDigestHeader } from 'httpbis-digest-headers';
import type { Request } from 'http-message-signatures';
import { signMessage } from 'http-message-signatures/lib/httpbis';
import * as ed from '@noble/ed25519';

interface RequestLike extends Request {
  body?: string;
}

interface SignOptions {
  request: RequestLike;
  privateKey: Uint8Array;
  keyId: string;
}

export interface SignatureHeaders {
  Signature: string;
  'Signature-Input': string;
}

interface ContentHeaders {
  'Content-Digest': string;
  'Content-Length': string;
  'Content-Type': string;
}
type Headers = SignatureHeaders & Partial<ContentHeaders>;

async function createClient(env: Env) {
  return await createAuthenticatedClient({
    validateResponses: false,
    requestTimeoutMs: 10000,
    walletAddressUrl: env.OP_WALLET_ADDRESS,
    authenticatedRequestInterceptor: async (request) => {
      if (!request.method || !request.url) {
        throw new Error('Cannot intercept request: url or method missing')
      }

      const initialRequest = request.clone()

      const headers = await createHeaders({
          request: {
            method: request.method,
            url: request.url,
            headers: JSON.parse(
              JSON.stringify(Object.fromEntries(request.headers)),
            ),
            body: request.body
              ? JSON.stringify(await request.json())
              : undefined,
          },
          privateKey: extractPrivateKeyFromPEM(env.OP_PRIVATE_KEY),
          keyId:env.OP_KEY_ID
        });

      if (request.body) {
        initialRequest.headers.set(
          'Content-Type',
          headers['Content-Type'] as string,
        );
        initialRequest.headers.set(
          'Content-Digest',
          headers['Content-Digest'] as string,
        );
      }

      initialRequest.headers.set('Signature', headers['Signature'] as string);
      initialRequest.headers.set(
        'Signature-Input',
        headers['Signature-Input'],
      );

      return initialRequest as typeof request;
    }
  })
}

export async function getValidWalletAddress(env: Env, walletAddress: string) {
  const opClient = await createClient(env)
  const response = await getWalletAddress(env, walletAddress, opClient)
  return response
}

export async function createInteractiveGrant(
  env: Env,
  args: {
    walletAddress: WalletAddress
    redirectUrl?: string
  }
) {
  const opClient = await createClient(env)
  const clientNonce = crypto.randomUUID()
  const paymentId = createId()

  const outgoingPaymentGrant = await createOutgoingPaymentGrant({
    walletAddress: args.walletAddress,
    debitAmount: {
      value: String(1 * 10 ** args.walletAddress.assetScale),
      assetCode: args.walletAddress.assetCode,
      assetScale: args.walletAddress.assetScale
    },
    nonce: clientNonce,
    paymentId: paymentId,
    opClient,
    redirectUrl: args.redirectUrl
  })

  return outgoingPaymentGrant
}

export interface Amount {
  value: string
  assetCode: string
  assetScale: number
}

type CreateOutgoingPaymentParams = {
  walletAddress: WalletAddress
  debitAmount?: Amount
  receiveAmount?: Amount
  nonce?: string
  paymentId: string
  opClient: AuthenticatedClient
}

async function createOutgoingPaymentGrant(
  params: CreateOutgoingPaymentParams & { redirectUrl?: string }
): Promise<PendingGrant> {
  const {
    walletAddress,
    debitAmount,
    receiveAmount,
    nonce,
    paymentId,
    opClient,
    redirectUrl
  } = params

  const grant = await opClient.grant
    .request(
      {
        url: walletAddress.authServer
      },
      {
        access_token: {
          access: [
            {
              identifier: walletAddress.id,
              type: 'outgoing-payment',
              actions: ['create', 'read'],
              limits: {
                debitAmount: debitAmount,
                receiveAmount: receiveAmount
              }
            }
          ]
        },
        interact: {
          start: ['redirect'],
          finish: {
            method: 'redirect',
            uri: `${redirectUrl}?paymentId=${paymentId}`,
            nonce: nonce || ''
          }
        }
      }
    )
    .catch((error) => {
      console.error(error)
      
      const errorMessage = error.description || error.message
      const errorCode = error.code
      const errorStatus = error.status

      console.error({
        errorCode,
        errorStatus,
        errorMessage,
        url: redirectUrl,
        walletAddress
      })

      throw new Error('Could not retrieve outgoing payment grant.')
    })

  if (!isPendingGrant(grant)) {
    throw new Error('Expected interactive outgoing payment grant.')
  }

  return grant
}

export async function isGrantValidAndAccepted(
  env: Env,
  payment: PendingGrant,
  interactRef: string
): Promise<boolean> {
  const opClient = await createClient(env)

  const continuation = await opClient.grant.continue(
    {
      accessToken: payment.continue.access_token.value,
      url: payment.continue.uri
    },
    {
      interact_ref: interactRef
    }
  )

  if (!isFinalizedGrant(continuation)) {
    return false
  }

  // when continuation has access_token value it has been accepted by user
  return continuation?.access_token?.value ? true : false
}

export async function getWalletAddress(
  env: Env,
  url: string,
  opClient?: AuthenticatedClient
) {
  opClient ??= await createClient(env)
  const walletAddress = await opClient.walletAddress
    .get({
      url: toWalletAddressUrl(url)
    })
    .catch(() => {
      throw new Error('Invalid wallet address.')
    })

  return walletAddress
}

async function createHeaders({
    request,
    privateKey,
    keyId,
  }: SignOptions): Promise<Headers> {
    if (request.body) {
      const contentHeaders = createContentHeaders(request.body);
      request.headers = { ...request.headers, ...contentHeaders };
    }

    const signatureHeaders = await createSignatureHeaders({
      request,
      privateKey,
      keyId,
    });

    return {
      ...request.headers,
      ...signatureHeaders,
    };
  }

function createContentHeaders(body: string): ContentHeaders {
    return {
      'Content-Digest': createContentDigestHeader(
        JSON.stringify(JSON.parse(body)),
        ['sha-512'],
      ),
      'Content-Length': new TextEncoder().encode(body).length.toString(),
      'Content-Type': 'application/json',
    };
  }

async function createSignatureHeaders({
    request,
    privateKey,
    keyId,
  }: SignOptions): Promise<SignatureHeaders> {
    const components = ['@method', '@target-uri'];
    if (request.headers.Authorization || request.headers.authorization) {
      components.push('authorization');
    }

    if (request.body) {
      components.push('content-digest', 'content-length', 'content-type');
    }

    const signingKey = createSigner(privateKey, keyId);
    const { headers } = await signMessage(
      {
        name: 'sig1',
        params: ['keyid', 'created'],
        fields: components,
        key: signingKey,
      },
      {
        url: request.url,
        method: request.method,
        headers: request.headers,
      },
    );

    return {
      Signature: headers.Signature as string,
      'Signature-Input': headers['Signature-Input'] as string,
    };
  }

function createSigner(key: Uint8Array, keyId: string) {
    return {
      id: keyId,
      alg: 'ed25519',
      async sign(data: Uint8Array) {
        return Buffer.from(await ed.signAsync(data, key));
      },
    };
  }

  function extractPrivateKeyFromPEM(pemBase64: string): Uint8Array {
  try {
    const pemString = atob(pemBase64);
    
    if (!pemString.includes('BEGIN PRIVATE KEY') || !pemString.includes('END PRIVATE KEY')) {
      throw new Error('Invalid PEM format');
    }

    const base64Content = pemString
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');

    const derBytes = atob(base64Content);

    const bytes = new Uint8Array(derBytes.length);
    for (let i = 0; i < derBytes.length; i++) {
      bytes[i] = derBytes.charCodeAt(i);
    }

    return bytes.slice(-32);
  } catch (error) {
    console.error('Error extracting private key:', error);
    throw error;
  }
}
