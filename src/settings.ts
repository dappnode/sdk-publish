import { DEFAULT_IPFS_GATEWAY, LEGACY_IPFS_GATEWAY } from "params";

const ipfsApiUrlsKey = "ipfs-api-urls";

export function readIpfsApiUrls(): string {
  return localStorage.getItem(ipfsApiUrlsKey) ?? "";
}

export function writeIpfsApiUrls(ipfsApiUrls: string): void {
  localStorage.setItem(ipfsApiUrlsKey, ipfsApiUrls);
}

const ipfsGatewayUrlKey = "ipfs-gateway-urls";

export function readIpfsGatewayUrl(): string {
  const storedGateway = localStorage.getItem(ipfsGatewayUrlKey) ?? "";
  // Overwrite legacy gateway with the new default
  if (storedGateway === LEGACY_IPFS_GATEWAY) {
    writeIpfsGatewayUrl(DEFAULT_IPFS_GATEWAY);
    return DEFAULT_IPFS_GATEWAY;
  }
  return storedGateway;
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
