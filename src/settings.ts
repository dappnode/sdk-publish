const ipfsApiUrlsKey = "ipfs-api-urls";

export function readIpfsApiUrls(): string {
  return localStorage.getItem(ipfsApiUrlsKey) ?? "";
}

export function writeIpfsApiUrls(ipfsApiUrls: string): void {
  localStorage.setItem(ipfsApiUrlsKey, ipfsApiUrls);
}

/**
 * `ipfsApiUrls` is a multiline newline separated list of IPFS URLs
 */
export function parseIpfsApiUrls(ipfsApiUrls: string): string[] {
  return ipfsApiUrls
    .trim()
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row);
}
