import { ethers } from "ethers";
import { ChainId, NetworkId } from "types";
import { checkDpmPermissions } from "./checkPermissions";
import { executeDpmPublishTx } from "./executeDpmPublishTx";
import { parseDpmDnpName, parseEIP3770Address } from "./utils";

export async function publishXDaiTx(
  {
    dnpName,
    version,
    releaseHash,
    developerAddress,
  }: {
    dnpName: string;
    version: string;
    releaseHash: string;
    developerAddress?: string;
  },
  provider: ethers.providers.Web3Provider,
  dpmRegistries: Record<string, string>
): Promise<{ txHash: string }> {
  // Resolve registry and its network from the name
  const { repoName, registryName } = parseDpmDnpName(dnpName);

  const registryEIP3770Address = dpmRegistries[registryName];
  if (!registryEIP3770Address) {
    throw Error(`Unknown registry ${registryName}`);
  }

  const { chainId, address: registryAddress } = parseEIP3770Address(
    registryEIP3770Address
  );

  const network = await provider.getNetwork();

  if (String(network.chainId) !== NetworkId.xDAI)
    throw Error(
      `Must connect to xDAI network, current networkID: ${network.chainId}`
    );

  if (chainId !== ChainId.xDAI) {
    throw Error(`Registry chainID ${chainId} not supported`);
  }

  const accounts = await provider.listAccounts();
  const userAddress = accounts[0];

  if (!userAddress) {
    throw Error("provider.listAccounts returned an empty list");
  }

  const dmpStatus = await checkDpmPermissions(
    registryName,
    registryAddress,
    repoName,
    userAddress,
    provider
  );

  const txHash = await executeDpmPublishTx(
    dmpStatus,
    { dnpName, version, manifestHash: releaseHash, developerAddress },
    provider
  );

  return { txHash };
}
