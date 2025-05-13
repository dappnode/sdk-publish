import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { RepoAddresses } from "types";
import { isValidEns } from "utils/isValidEns";
import { resolveDnpName } from "utils/resolveDnpName";
import BaseCard from "components/BaseCard";
import Button from "components/Button";
import Input from "components/Input";
import Title from "components/Title";

interface PackageENSStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  provider: ethers.Provider;
  dnpName: string;
  setDnpName: React.Dispatch<React.SetStateAction<string>>;
  repoAddresses: RepoAddresses | undefined;
  setRepoAddresses: React.Dispatch<RepoAddresses | undefined>
}

export default function PackageENSStep({ 
  setStepper, 
  provider, 
  dnpName,
  setDnpName,
  repoAddresses,
  setRepoAddresses
}: PackageENSStepProps) {
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    async function checkDnpName(repoName: string, provider: ethers.Provider) {
      setIsResolving(true);
      try {
        const repoAddresses = await resolveDnpName(repoName, provider);
        setRepoAddresses(repoAddresses);
      } catch (e) {
        // Only log the error but don't clear repoAddresses
        // This prevents the button from being disabled on temporary resolution errors
        console.error(`Error resolving dnpName ${repoName}`, e);
      } finally {
        setIsResolving(false);
      }
    }

    if (isValidEns(dnpName)) checkDnpName(dnpName, provider);
  }, [dnpName, provider, setRepoAddresses]);

  const validations = [
    dnpName
      ? isValidEns(dnpName)
        ? { isValid: true, message: "Valid ENS domain" }
        : { isValid: false, message: "Invalid ENS domain" }
      : null,
    dnpName && repoAddresses
      ? repoAddresses.registryAddress
        ? repoAddresses.repoAddress
          ? {
              isValid: true,
              message: `Repo found at: ${repoAddresses.repoAddress}`,
            }
          : {
              isValid: false,
              message: `No existing repo found for ${dnpName}. Provide an existing repo.`,
            }
        : {
            isValid: false,
            message: `No valid registry found for ${dnpName}`,
          }
      : null,
  ];

  const errors = validations
    .filter((validation) => validation !== null && !validation?.isValid)
    .map((validation) => validation?.message ?? "");

  return (
    <BaseCard
      hasBack={() => {
        setStepper((prevState) => prevState - 1);
      }}
    >
      <Title title={"Provide package ENS"} />
      <p>Enter the ENS name of a dappnode package.</p>
      <div>
        <Input
          name="Dappnode Package name"
          placeholder="i.e. yourpackage.public.dappnode.eth"
          value={dnpName}
          error={errors.length > 0}
          success={validations.some((v) => v?.isValid)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDnpName(e.target.value)
          }
        />
        {validations.map(
          (validation, i) =>
            validation && (
              <div
                key={i}
                className={`mt-2 font-poppins text-xs ${
                  validation.isValid
                    ? "text-success-green"
                    : "text-error-red"
                }`}
              >
                {validation.message}
              </div>
            )
        )}
      </div>
      <Button
        onClick={() => setStepper((prevState) => prevState + 1)}
        disabled={errors.length > 0 || !dnpName || !repoAddresses?.repoAddress || isResolving}
      >
        Next
      </Button>
    </BaseCard>
  );
}
