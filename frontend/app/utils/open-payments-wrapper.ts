import * as openPayments from '@interledger/open-payments'
import cryptoPolyfill from '../../crypto-polyfill.js'
import { CreateAuthenticatedClientArgs } from '@interledger/open-payments/dist/client/index.js';

function registerCryptoPolyfill() {
    globalThis.crypto = cryptoPolyfill;
    global.crypto = cryptoPolyfill;
}

export function createPolyfillAuthenticatedClient(options: CreateAuthenticatedClientArgs) {
  registerCryptoPolyfill();
  return openPayments.createAuthenticatedClient(options);
}

export const {
  createAuthenticatedClient,
  isPendingGrant, 
  isFinalizedGrant
} = openPayments;

export type {
  WalletAddress,
  PendingGrant,
  AuthenticatedClient,
  Grant,
  GrantContinuation,
} from '@interledger/open-payments';

// export * from '@interledger/open-payments';