import { ethers } from "ethers";
import React, { useState } from "react";
import { RepoAddresses } from "types";
import BaseCard from "components/BaseCard";
import Button from "components/Button";
import Input from "components/Input";
import Title from "components/Title";

interface PackagePermissionsProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  provider: ethers.Provider;
  dnpName: string;
  account: string | null;
}

export default function PackagePermissions({
  setStepper,
  provider,
  dnpName,
  account,
}: PackagePermissionsProps) {
  const [newManagerAddress, setNewManagerAddress] = useState("");
  const [newDeveloperAddress, setNewDeveloperAddress] = useState("");
  const [revokeDeveloperAddress, setRevokeDeveloperAddress] = useState("");
  const [activeTab, setActiveTab] = useState<"manager" | "grant" | "revoke">(
    "manager",
  );

  // Mock data - in a real app, this would come from your Web3 connection
  const [packageData] = useState({
    managerAddress: "0x1234...5678",
    isManager: true,
    isDeveloper: true,
    developers: ["0x9876...5432", "0xabcd...efgh"],
  });

  const handleChangeManager = () => {
    console.log("Change manager to:", newManagerAddress);
    // Web3 interaction would happen here
    setNewManagerAddress("");
  };

  const handleGrantDeveloper = () => {
    console.log("Grant developer permission to:", newDeveloperAddress);
    // Web3 interaction would happen here
    setNewDeveloperAddress("");
  };

  const handleRevokeDeveloper = () => {
    console.log("Revoke developer permission from:", revokeDeveloperAddress);
    // Web3 interaction would happen here
    setRevokeDeveloperAddress("");
  };

  return (
    <BaseCard
      hasBack={() => {
        setStepper((prevState) => prevState - 1);
      }}
    >
      <Title title={"Package Permissions"} />
      <p >Manage permissions for package {dnpName}</p>

      {/* Role Status */}
      <div className="rounded-lg border p-3 flex gap-3">
        <h3 className="mt-1 font-poppins font-medium">Your Roles:</h3>
        <div className="flex flex-wrap gap-2">
          {packageData.isManager && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
              Manager
            </span>
          )}
          {packageData.isDeveloper && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              Developer
            </span>
          )}
          {!packageData.isManager && !packageData.isDeveloper && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
              Standard User
            </span>
          )}
        </div>
      </div>

      {/* Manager Controls */}
      {packageData.isManager && (
        <div className="mb-6">
          <div className="mb-4 flex  justify-between border-b">
            <button
              className={`px-4 py-2 font-poppins ${
                activeTab === "manager" ? "border-b-2 border-purple-500 " : ""
              }`}
              onClick={() => setActiveTab("manager")}
            >
              Change Manager
            </button>
            <button
              className={`px-4 py-2 font-poppins ${
                activeTab === "grant" ? "border-b-2 border-purple-500 " : ""
              }`}
              onClick={() => setActiveTab("grant")}
            >
              Grant Developer
            </button>
            <button
              className={`px-4 py-2 font-poppins ${
                activeTab === "revoke" ? "border-b-2 border-purple-500 " : ""
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
                onChange={(e) => setNewManagerAddress(e.target.value)}
              />
              <div className="rounded-lg bg-yellow-50 p-4 font-poppins text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> Changing the manager will transfer
                full control of this package to the specified address, and you
                will lose all access. This action is irreversible.
              </div>
              <div className="mt-2 rounded-lg bg-blue-50 p-4 font-poppins text-sm text-blue-800">
                <strong>Note:</strong> Transferring the manager role does not
                automatically grant developer permissions to the new address. If
                you wish to grant developer access, you must do so separately.
              </div>

              <Button onClick={handleChangeManager}>
                Transfer Manager Role
              </Button>
            </div>
          )}

          {activeTab === "grant" && (
            <div className="space-y-4">
              <Input
                name="New Developer Address"
                placeholder="0x..."
                value={newDeveloperAddress}
                onChange={(e) => setNewDeveloperAddress(e.target.value)}
              />
              <Button onClick={handleGrantDeveloper}>
                Grant Developer Permission
              </Button>
            </div>
          )}

          {activeTab === "revoke" && (
            <div className="space-y-4">
              <Input
                name="Developer Address to Revoke"
                placeholder="0x..."
                value={revokeDeveloperAddress}
                onChange={(e) => setRevokeDeveloperAddress(e.target.value)}
              />
              <Button
                onClick={handleRevokeDeveloper}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Revoke Developer Permission
              </Button>
            </div>
          )}
        </div>
      )}
    </BaseCard>
  );
}
