import { EIP3770Address, EIP3770AddressStr } from "../../types";

export function parseEIP3770Address(
  eip3770AddressStr: EIP3770AddressStr
): EIP3770Address {
  // EIP-3770: Chain-specific addresses https://eips.ethereum.org/EIPS/eip-3770
  // xdai:0x01c58A553F92A61Fd713e6006fa7D1d82044c389
  const chrIdx = eip3770AddressStr.indexOf(":");
  if (chrIdx < 0) {
    throw Error(`Invalid EIP-3770 address no ':' ${eip3770AddressStr}`);
  }

  const chainId = eip3770AddressStr.slice(0, chrIdx);
  const address = eip3770AddressStr.slice(chrIdx + 1);

  return { chainId, address };
}

/**
 * @param dnpName 'geth.dnp.dappnode.eth'
 * @returns 'geth' / 'dnp.dappnode.eth'
 */
export function parseDpmDnpName(dnpName: string): {
  repoName: string;
  registryName: string;
} {
  const dotIdx = dnpName.indexOf(".");
  if (dotIdx < 0) {
    throw Error(`Invalid dnpName ${dnpName} must contain the '.' character`);
  }

  const repoName = dnpName.slice(0, dotIdx);
  const registryName = dnpName.slice(dotIdx + 1);

  return { repoName, registryName };
}
