import { manifestFileName } from "params";
import { Manifest } from "types";

export async function fetchManifest(
  hash: string,
  IPFS_GATEWAY: string,
): Promise<Manifest> {
  try {
    return await fetch(`${IPFS_GATEWAY}${hash}/${manifestFileName}`).then(
      (res) => res.json(),
    );
  } catch (e) {
    return await fetch(`${IPFS_GATEWAY}${hash}`).then((res) => res.json());
  }
}
