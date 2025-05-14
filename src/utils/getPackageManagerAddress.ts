import { ethers } from "ethers";
import publicACL from "contracts/publicACL.json";
import dnpACL from "contracts/dnpACL.json";

export async function getPackageManagerAddress(
  dnpName: string,
  repoAddress: string,
  provider: ethers.Provider,
): Promise<string> {
  // Detect if package is public or dnp
  const isDnp = dnpName.includes(".dnp.dappnode.eth");

  const contractABI = isDnp ? dnpACL.abi : publicACL.abi;
  const contractAddress = isDnp ? dnpACL.address : publicACL.address;

  // Create contract instance
  const repo = new ethers.Contract(contractAddress, contractABI, provider);

  try {
    // Call the manager function on the contract
    const managerAddress = await repo.getPermissionManager(
      repoAddress,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );
    return managerAddress;
  } catch (e) {
    // Rename error for user comprehension
    e.message = `Error getting manager address for ${dnpName}: ${e.message}`;
    throw e;
  }
}
