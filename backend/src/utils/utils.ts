export function walletAddressToKey(walletAddress: string): string {
    return `${decodeURIComponent(walletAddress).replace('$', '').replace('https://', '')}.json`
}
