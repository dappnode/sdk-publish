import { ethers } from "ethers";
import { registryAbi } from "./registryAbi";
import { repoAbi } from "./repoAbi";

export type DmpStatus =
  | {
      repoExists: true;
      repoAddress: string;
    }
  | {
      repoExists: false;
      registryAddress: string;
    };

/**
 * - Check registry exists
 * - Check registry name matches
 * - Check if repo is published
 * - Check if address has permissions for Repo
 * - Check if address has permissions for Registry
 */
export async function checkDpmPermissions(
  registryName: string,
  registryAddress: string,
  repoName: string,
  userAddress: string,
  provider: ethers.providers.Provider
): Promise<DmpStatus> {
  const registry = new ethers.Contract(registryAddress, registryAbi, provider);

  let actualRegistryName: string;
  try {
    actualRegistryName = await registry.registryName();
  } catch (e) {
    (e as Error).message = `Registry ${registryAddress} not found: ${
      (e as Error).message
    }`;
    throw e;
  }

  if (actualRegistryName !== registryName) {
    throw Error(
      `Registry at address ${registryAddress} has registryName ${actualRegistryName} instead of expected ${registryName}`
    );
  }

  const registryPackage = await registry.getPackage(repoName).catch(() => null);

  if (registryPackage === null) {
    // Package not published

    const ADD_PACKAGE_ROLE = await registry.ADD_PACKAGE_ROLE();
    const hasRole = await registry.hasRole(ADD_PACKAGE_ROLE, userAddress);

    if (!hasRole) {
      throw Error(
        `Address ${userAddress} not allowed to publish to registry ${registryName}`
      );
    }

    return {
      repoExists: false,
      registryAddress,
    };
  } else {
    // Package published

    const repoAddress = registryPackage.repo;
    const repo = new ethers.Contract(repoAddress, repoAbi, provider);
    const CREATE_VERSION_ROLE = await repo.CREATE_VERSION_ROLE();
    const hasRole = await repo.hasRole(CREATE_VERSION_ROLE, userAddress);

    if (!hasRole) {
      throw Error(
        `Address ${userAddress} not allowed to publish to repo ${repoName}`
      );
    }
    return {
      repoExists: true,
      repoAddress,
    };
  }
}
