import { ethers } from "ethers";
import publicAclAbi from "contracts/publicAclAbi.json";
import dnpAclAbi from "contracts/dnpAclAbi.json";

export async function getPackageManagerAddress(
  dnpName: string,
  repoAddress: string,
  provider: ethers.Provider,
): Promise<string> {
  const dnpAclAddress = "0x89d0A07b792754460Faa49e57437B40aA33FB757";
  const publicAclAddress = "0xFCb2C44E61031AE29e5c54A700FB6B4FB430dA4C";

  // Detect if package is public or dnp
  const isDnp = dnpName.includes(".dnp.dappnode.eth");

  const contractABI = isDnp ? dnpAclAbi : publicAclAbi;
  const contractAddress = isDnp ? dnpAclAddress : publicAclAddress;

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
