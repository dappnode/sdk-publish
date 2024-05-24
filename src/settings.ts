const ipfsApiUrlsKey = "ipfs-api-urls";

export function readIpfsApiUrls(): string {
  return localStorage.getItem(ipfsApiUrlsKey) ?? "";
}

export function writeIpfsApiUrls(ipfsApiUrls: string): void {
  localStorage.setItem(ipfsApiUrlsKey, ipfsApiUrls);
}

const ipfsGatewayUrlKey = "ipfs-gateway-urls";

export function readIpfsGatewayUrl(): string {
  return localStorage.getItem(ipfsGatewayUrlKey) ?? "";
}

export function writeIpfsGatewayUrl(ipfsGatewayUrl: string): void {
  localStorage.setItem(ipfsGatewayUrlKey, ipfsGatewayUrl);
}
/**
 * `ipfsApiUrls` is a multiline newline separated list of IPFS URLs
 */
export function parseIpfsUrls(ipfsApiUrls: string): string[] {
  return ipfsApiUrls
    .trim()
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row);
}
