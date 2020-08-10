import { ethers } from "ethers";
import repoContract from "contracts/repository.json";

export async function getLatestVersion(
  repoAddress: string,
  provider: ethers.providers.Provider
): Promise<string> {
  const repo = new ethers.Contract(repoAddress, repoContract.abi, provider);

  try {
    const res = await repo.getLatest();
    return res.semanticVersion.join(".");
  } catch (e) {
    // Rename error for user comprehension
    e.message = `Error getting latest version of ${repoAddress}: ${e.message}`;
    throw e;
  }
}
