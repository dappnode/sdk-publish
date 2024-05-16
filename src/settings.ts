const ipfsApiUrlsKey = "ipfs-api-urls";

export function readIpfsApiUrls(): string {
  return localStorage.getItem(ipfsApiUrlsKey) ?? "";
}

export function writeIpfsApiUrls(ipfsApiUrls: string): void {
  localStorage.setItem(ipfsApiUrlsKey, ipfsApiUrls);
}

const ipfsGatewayUrlsKey = "ipfs-gateway-urls";

export function readIpfsGatewayUrls(): string {
  return localStorage.getItem(ipfsGatewayUrlsKey) ?? "";
}

export function writeIpfsGatewayUrls(ipfsGatewayUrls: string): void {
  localStorage.setItem(ipfsGatewayUrlsKey, ipfsGatewayUrls);
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
