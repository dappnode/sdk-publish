import { signatureFileName } from "params";

/**
 * A bit hacky...
 *
 * Checks if the HTML to list directory files include a signature.json file
 */
export async function fetchReleaseIncludesSignature(
  hash: string,
  IPFS_GATEWAY: string
) {
  const filesStr = await fetchReleaseFilesTxt(hash, IPFS_GATEWAY);
  console.log(filesStr);
  return filesStr.includes(`${hash}/${signatureFileName}`);
}

async function fetchReleaseFilesTxt(hash: string, IPFS_GATEWAY: string) {
  return await fetch(`${IPFS_GATEWAY}${hash}`).then((res) => res.text());
}
