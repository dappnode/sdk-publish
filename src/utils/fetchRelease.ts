import { signatureFileName } from "params";
import { parseIpfsPath } from "./isIpfsHash";

export async function fetchReleaseSignature(
  hash: string,
  IPFS_GATEWAY: string
): Promise<string> {
  hash = parseIpfsPath(hash);

  const res = await fetch(`${IPFS_GATEWAY}/ipfs/${hash}/${signatureFileName}`);

  if (!res.ok) {
    throw Error(`Error ${res.statusText}`);
  }

  return await res.text();
}
