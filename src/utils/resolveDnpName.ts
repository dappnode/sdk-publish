import { ethers } from "ethers";
import { RepoAddresses } from "types";

export async function resolveDnpName(
  dnpName: string,
  provider: ethers.Provider
): Promise<RepoAddresses> {
  const registryName = parseRegistryName(dnpName);
  const [registryAddress, repoAddress] = await Promise.all([
    resolveEns(registryName, provider),
    resolveEns(dnpName, provider),
  ]);
  return { registryAddress, repoAddress };
}

// Ens throws if a node is not found
//
// ens.resolver('admin.dnp.dappnode.eth').addr()
// ==> 0xee66c4765696c922078e8670aa9e6d4f6ffcc455
// ens.resolver('fake.dnp.dappnode.eth').addr()
// ==> Unhandled rejection Error: ENS name not found
//
// Change behaviour to return null if not found
async function resolveEns(
  ensName: string,
  provider: ethers.Provider
): Promise<string | null> {
  try {
    return await provider.resolveName(ensName);
  } catch (e) {
    if (e.message.includes("not found")) return null;
    else throw e;
  }
}

function parseRegistryName(repoName: string): string {
  return repoName.split(".").slice(1).join(".");
}
