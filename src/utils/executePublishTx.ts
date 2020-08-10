import { ethers } from "ethers";
import registryContract from "contracts/registry.json";
import repoContract from "contracts/repository.json";
import { resolveDnpName } from "./resolveDnpName";

export async function executePublishTx(
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
  const { registryAddress, repoAddress } = await resolveDnpName(
    dnpName,
    provider
  );

  // Compute tx data
  const contentURI = "0x" + Buffer.from(manifestHash, "utf8").toString("hex");
  // @param _contractAddress address for smart contract logic for version (if set to 0, it uses last versions' contractAddress)
  const contractAddress = "0x0000000000000000000000000000000000000000";
  const shortName = dnpName.split(".")[0];

  let unsignedTx: ethers.PopulatedTransaction;
  // If repository exists, push new version to it
  if (repoAddress) {
    // newVersion(
    //     uint16[3] _newSemanticVersion,
    //     address _contractAddress,
    //     bytes _contentURI
    // )
    const repo = new ethers.Contract(repoAddress, repoContract.abi, signer);
    unsignedTx = await repo.populateTransaction.newVersion(
      version.split("."), // uint16[3] _newSemanticVersion
      contractAddress, // address _contractAddress
      contentURI // bytes _contentURI
    );
  }
  // If repo does not exist, create a new repo and push version
  else {
    // A developer address can be provided by the option developerAddress.
    // If it is not provided a prompt will ask for it

    if (!developerAddress)
      throw Error("developerAddress must be defined for new repos");

    if (!registryAddress) throw Error(`No registry found for ${dnpName}`);

    // newRepoWithVersion(
    //     string _name,
    //     address _dev,
    //     uint16[3] _initialSemanticVersion,
    //     address _contractAddress,
    //     bytes _contentURI
    // )
    const registry = new ethers.Contract(
      registryAddress,
      registryContract.abi,
      signer
    );
    unsignedTx = await registry.populateTransaction.newRepoWithVersion(
      shortName, // string _name
      developerAddress, // address _dev
      version.split("."), // uint16[3] _initialSemanticVersion
      contractAddress, // address _contractAddress
      contentURI // bytes _contentURI
    );
  }

  const txResponse = await signer.sendTransaction(unsignedTx);
  return txResponse.hash;
}
