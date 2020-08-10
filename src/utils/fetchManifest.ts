import { Manifest } from "types";

export async function fetchManifest(
  hash: string,
  ipfsGateway: string
): Promise<Manifest> {
  try {
    return await fetch(
      `${ipfsGateway}${hash}/dappnode_package.json`
    ).then((res) => res.json());
  } catch (e) {
    return await fetch(`${ipfsGateway}${hash}`).then((res) => res.json());
  }
}
