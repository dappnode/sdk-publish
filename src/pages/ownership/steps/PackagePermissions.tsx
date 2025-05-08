import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { apmRepoIsAllowed } from "utils/apmRepoIsAllowed";
import { getPackageManagerAddress } from "utils/getPackageManagerAddress";
import BaseCard from "components/BaseCard";
import Button from "components/Button";
import Input from "components/Input";
import Title from "components/Title";
import { setNewManager } from "utils/setNewManager";

interface PackagePermissionsProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  provider: ethers.BrowserProvider;
  dnpName: string;
  account: string | null;
  repoAddress: string;
}

export default function PackagePermissions({
  setStepper,
  provider,
  dnpName,
  account,
  repoAddress,
}: PackagePermissionsProps) {
  const [newManagerAddress, setNewManagerAddress] = useState("");
  const [newDeveloperAddress, setNewDeveloperAddress] = useState("");
  const [revokeDeveloperAddress, setRevokeDeveloperAddress] = useState("");
  const [activeTab, setActiveTab] = useState<"manager" | "grant" | "revoke">(
    "manager",
  );
  const [isManager, setIsManager] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  // Get validation message for an address
  const getAddressValidationMessage = (address: string): string | null => {
    if (!address) return null;
    if (!isValidAddress(address)) return "Invalid Ethereum address";
    
    // Only prevent using own address for manager changes
    if (activeTab === "manager" && address.toLowerCase() === account?.toLowerCase()) {
      return "Cannot transfer manager role to your own address";
    }
    
    return null;
  };

  // Get current address based on active tab
  const getCurrentAddress = (): string => {
    switch (activeTab) {
      case "manager":
        return newManagerAddress;
      case "grant":
        return newDeveloperAddress;
      case "revoke":
        return revokeDeveloperAddress;
      default:
        return "";
    }
  };

  // Check if current address is valid
  const isCurrentAddressValid = (): boolean => {
    const address = getCurrentAddress();
    if (!address || !isValidAddress(address)) return false;
    
    // Only prevent using own address for manager changes
    if (activeTab === "manager" && address.toLowerCase() === account?.toLowerCase()) {
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    async function checkPermissions() {
      if (!account) return;

      setIsLoading(true);
      try {
        // Check if user is developer
        const isDev = await apmRepoIsAllowed(repoAddress, account, provider);
        setIsDeveloper(isDev);

        // Check if user is manager
        const managerAddress = await getPackageManagerAddress(
          dnpName,
          repoAddress,
          provider,
        );
        setIsManager(managerAddress.toLowerCase() === account.toLowerCase());
      } catch (e) {
        console.error("Error checking permissions:", e);
      } finally {
        setIsLoading(false);
      }
    }

    checkPermissions();
  }, [account, provider, repoAddress, dnpName]);

  const handleChangeManager = async () => {
    if (!isCurrentAddressValid()) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await setNewManager(newManagerAddress, dnpName, repoAddress, provider);
      setNewManagerAddress("");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantDeveloper = async () => {
    if (!isCurrentAddressValid()) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      // TODO: Implement grant developer functionality
      console.log("Grant developer permission to:", newDeveloperAddress);
      setNewDeveloperAddress("");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeDeveloper = async () => {
    if (!isCurrentAddressValid()) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      // TODO: Implement revoke developer functionality
      console.log("Revoke developer permission from:", revokeDeveloperAddress);
      setRevokeDeveloperAddress("");
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <BaseCard
        hasBack={() => {
          setStepper((prevState) => prevState - 1);
        }}
      >
        <Title title={"Package Permissions"} />
        <p className="font-poppins">Loading permissions...</p>
      </BaseCard>
    );
  }

  return (
    <BaseCard
      hasBack={() => {
        setStepper((prevState) => prevState - 1);
      }}
    >
      <Title title={"Package Permissions"} />
      <p className="font-poppins">Manage permissions for package {dnpName}</p>

      {/* Role Status */}
      <div className="flex gap-3 rounded-lg border p-3">
        <h3 className="mt-1 font-poppins font-medium">Your Roles:</h3>
        <div className="flex flex-wrap gap-2">
          {isManager && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              Manager
            </span>
          )}
          {isDeveloper && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              Developer
            </span>
          )}
          {!isManager && !isDeveloper && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
              Standard User
            </span>
          )}
        </div>
      </div>

      {/* Manager Controls */}
      {isManager && (
        <div className="mb-6">
          <div className="mb-4 flex justify-between border-b">
            <button
              className={`px-4 py-2 font-poppins ${
                activeTab === "manager" ? "border-b-2 border-purple-500" : ""
              }`}
              onClick={() => setActiveTab("manager")}
            >
              Change Manager
            </button>
            <button
              className={`px-4 py-2 font-poppins ${
                activeTab === "grant" ? "border-b-2 border-purple-500" : ""
              }`}
              onClick={() => setActiveTab("grant")}
            >
              Grant Developer
            </button>
            <button
              className={`px-4 py-2 font-poppins ${
                activeTab === "revoke" ? "border-b-2 border-purple-500" : ""
              }`}
              onClick={() => setActiveTab("revoke")}
            >
              Revoke Developer
            </button>
          </div>

          {activeTab === "manager" && (
            <div className="space-y-4">
              <Input
                name="New Manager Address"
                placeholder="0x..."
                value={newManagerAddress}
                error={!!getAddressValidationMessage(newManagerAddress)}
                onChange={(e) => setNewManagerAddress(e.target.value)}
              />
              {getAddressValidationMessage(newManagerAddress) && (
                <p className="text-sm text-error-red font-poppins">
                  {getAddressValidationMessage(newManagerAddress)}
                </p>
              )}
              <div className="rounded-lg bg-red-50 p-4 font-poppins text-sm text-red-800">
                ⚠️ <strong>Danger:</strong> Changing the manager will transfer
                full control of this package to the specified address, and you
                will lose all access. This action is irreversible.
              </div>
              <div className="mt-2 rounded-lg bg-blue-50 p-4 font-poppins text-sm text-blue-800">
                <strong>Note:</strong> Transferring the manager role does not
                automatically grant developer permissions to the new address. If
                you wish to grant developer access, you must do so separately.
              </div>

              <Button 
                onClick={handleChangeManager}
                disabled={!isCurrentAddressValid() || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Transfer Manager Role"}
              </Button>
            </div>
          )}

          {activeTab === "grant" && (
            <div className="space-y-4">
              <Input
                name="New Developer Address"
                placeholder="0x..."
                value={newDeveloperAddress}
                error={!!getAddressValidationMessage(newDeveloperAddress)}
                onChange={(e) => setNewDeveloperAddress(e.target.value)}
              />
              {getAddressValidationMessage(newDeveloperAddress) && (
                <p className="text-sm text-error-red font-poppins">
                  {getAddressValidationMessage(newDeveloperAddress)}
                </p>
              )}
              <Button 
                onClick={handleGrantDeveloper}
                disabled={!isCurrentAddressValid() || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Grant Developer Permission"}
              </Button>
            </div>
          )}

          {activeTab === "revoke" && (
            <div className="space-y-4">
              <Input
                name="Developer Address to Revoke"
                placeholder="0x..."
                value={revokeDeveloperAddress}
                error={!!getAddressValidationMessage(revokeDeveloperAddress)}
                onChange={(e) => setRevokeDeveloperAddress(e.target.value)}
              />
              {getAddressValidationMessage(revokeDeveloperAddress) && (
                <p className="text-sm text-error-red font-poppins">
                  {getAddressValidationMessage(revokeDeveloperAddress)}
                </p>
              )}
              <Button
                onClick={handleRevokeDeveloper}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={!isCurrentAddressValid() || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Revoke Developer Permission"}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 font-poppins text-sm text-red-800">
              {error}
            </div>
          )}
        </div>
      )}
    </BaseCard>
  );
}