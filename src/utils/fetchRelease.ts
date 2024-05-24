import { signatureFileName } from "params";
import { parseIpfsPath } from "./isIpfsHash";

export async function fetchReleaseSignature(
  hash: string,
  IPFS_GATEWAY: string,
): Promise<string> {
  hash = parseIpfsPath(hash);

  try {
    const url = new URL(`/ipfs/${hash}/${signatureFileName}`, IPFS_GATEWAY);

    const res = await fetch(url.toString());
    console.log(res);
    if (!res.ok) {
      throw Error(`Error ${res.statusText}`);
    }

    return await res.text();
  } catch (e) {
    throw Error(`Error: Invalid IPFS gateway. ${e}`);
  }
}
