import { ethers } from "ethers";
import publicACL from "contracts/publicACL.json";
import dnpACL from "contracts/dnpACL.json";

export async function setNewManager(
  newManagerAddress: string,
  dnpName: string,
  repoAddress: string,
  provider: ethers.BrowserProvider,
): Promise<string> {
  if (!newManagerAddress) throw Error("newManagerAddress must be defined");
  if (!dnpName) throw Error("dnpName must be defined");
  if (!repoAddress) throw Error("repoAddress must be defined");

  const signer = await provider.getSigner();

  // Detect if package is public or dnp
  const isDnp = dnpName.includes(".dnp.dappnode.eth");

  const contractABI = isDnp ? dnpACL.abi : publicACL.abi;
  const contractAddress = isDnp ? dnpACL.address : publicACL.address;

  // Create contract instance with signer
  const acl = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    // Create the transaction
    const unsignedTx = {
      to: contractAddress,
      data: acl.interface.encodeFunctionData("setPermissionManager", [
        newManagerAddress,
        repoAddress,
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ]),
    };

    // Send the transaction
    const txResponse = await signer.sendTransaction(unsignedTx);
    return txResponse.hash;
  } catch (e) {
    // Rename error for user comprehension
    e.message = `Error setting new manager address for ${dnpName}: ${e.message}`;
    throw e;
  }
}
