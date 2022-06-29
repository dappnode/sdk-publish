import { ethers } from "ethers";
import { registryAbi } from "./registryAbi";
import { repoAbi } from "./repoAbi";
import { DmpStatus } from "./checkPermissions";
import { parseDpmDnpName } from "./utils";
import { normalizeIpfsPath } from "utils/isIpfsHash";

export async function executeDpmPublishTx(
  status: DmpStatus,
  {
    dnpName,
    version,
    manifestHash,
    developerAddress,
  }: {
    dnpName: string;
    version: string;
    manifestHash: string;
    developerAddress?: string;
  },
  provider: ethers.providers.Web3Provider
) {
  if (!dnpName) throw Error("dnpName must be defined");
  if (!version) throw Error("version must be defined");
  if (!manifestHash) throw Error("manifestHash must be defined");

  const signer = provider.getSigner();

  // Compute tx data
  // contentURI in ENSIP-7 format
  const ipfsHash = normalizeIpfsPath(manifestHash);
  const contentURI = "ipfs://" + ipfsHash;

  let unsignedTx: ethers.PopulatedTransaction;
  // If repository exists, push new version to it
  if (status.repoExists) {
    const repo = new ethers.Contract(status.repoAddress, repoAbi, signer);
    unsignedTx = await repo.populateTransaction.newVersion(
      version, // string _version
      [contentURI] // string[] _contentURIs
    );
  }

  // If repo does not exist, create a new repo and push version
  else {
    // A developer address can be provided by the option developerAddress.
    // If it is not provided a prompt will ask for it

    const { repoName } = parseDpmDnpName(dnpName);

    if (!developerAddress)
      throw Error("developerAddress must be defined for new repos");

    // TODO: Ask user for flags if repo allows customizing those
    const defaultFlags = 0b000;

    const registry = new ethers.Contract(
      status.registryAddress,
      registryAbi,
      signer
    );
    unsignedTx = await registry.populateTransaction.newPackageWithVersion(
      repoName, // string _name
      developerAddress, // address _dev
      defaultFlags, // uint8 flags
      version, // string _version
      [contentURI] // string[] _contentURIs
    );
  }

  const txResponse = await signer.sendTransaction(unsignedTx);
  return txResponse.hash;
}
