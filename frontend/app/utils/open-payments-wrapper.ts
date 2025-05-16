import * as openPayments from '@interledger/open-payments'
import cryptoPolyfill from '../../crypto-polyfill.js'

function registerCryptoPolyfill() {
    globalThis.crypto = cryptoPolyfill;
}

export function createPolyfillAuthenticatedClient(options: Parameters<typeof openPayments.createAuthenticatedClient>[0]) {
  registerCryptoPolyfill();
  return openPayments.createAuthenticatedClient(options);
}

export * from '@interledger/open-payments';