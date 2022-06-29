// @ts-ignore // No type definitions for "is-ipfs"
import isIPFS from "is-ipfs";
import { RegistryMode } from "types";

const ipfsPathPrefixes = ["ipfs/", "/ipfs/", "ipfs://"];

/**
 * @param contentURI
 * - APM: '/ipfs/QmdjrkKfD8ZAA8zHBAFC9y162R52qKcikuVXDNMKMhEsUr'
 * - DPM: 'ipfs://QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD'
 * @returns 'QmdjrkKfD8ZAA8zHBAFC9y162R52qKcikuVXDNMKMhEsUr'
 */
export function normalizeIpfsPath(contentURI: string): string {
  for (const prefix of ipfsPathPrefixes) {
    if (contentURI.startsWith(prefix)) {
      return contentURI.split(prefix)[1];
    }
  }

  return contentURI;
}

export function formatContentURI(
  ipfsHash: string,
  registryMode: RegistryMode
): string {
  switch (registryMode) {
    case RegistryMode.APM:
      return `/ipfs/${ipfsHash}`;
    case RegistryMode.DPM:
      return `ipfs://${ipfsHash}`;
  }
}

function isMultihash(hash: string) {
  return isIPFS.cid(hash);
}

/**
 * Checks if the given string is a valid IPFS CID or path
 *
 * isIPFS.cid('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o') // true (CIDv0)
 * isIPFS.cid('zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7') // true (CIDv1)
 * isIPFS.cid('noop') // false
 *
 * @param hash
 */
export function isIpfsHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") return false;
  // Correct hash prefix
  hash = normalizeIpfsPath(hash);
  hash.replace("/", "");
  // Make sure hash if valid
  return isMultihash(hash);
}
