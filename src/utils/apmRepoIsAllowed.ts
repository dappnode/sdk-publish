import { ethers } from "ethers";
import repoContract from "contracts/repository.json";

export async function apmRepoIsAllowed(
  repoAddress: string,
  userAddress: string,
  provider: ethers.Provider
): Promise<boolean> {
  const repo = new ethers.Contract(repoAddress, repoContract.abi, provider);

  try {
    return await repo.canPerform(
      userAddress,
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      []
    );
  } catch (e) {
    // Rename error for user comprehension
    e.message = `Error calling canPerform(${userAddress}): ${e.message}`;
    throw e;
  }
}
