import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import semver from "semver";
import { FormField, Manifest, RepoAddresses } from "types";
import { isIpfsHash } from "utils/isIpfsHash";
import { isValidBump } from "utils/isValidBump";
import { isValidEns } from "utils/isValidEns";
import { notNullish } from "utils/notNullish";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Input from "../Input";
import Title from "../Title";

interface IntroductionStepProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
}

export default function IntroductionStep({ stepper }: IntroductionStepProps) {
  // Form input variables
  const [dnpName, setDnpName] = useState("");
  const [version, setVersion] = useState("");
  const [developerAddress, setDeveloperAddress] = useState("");
  const [releaseHash, setReleaseHash] = useState("");

  const [repoAddresses, setRepoAddresses] = useState<RepoAddresses>();
  const [latestVersion, setLatestVersion] = useState<string>();
  const [manifest, setManifest] = useState<Manifest & { hash: string }>();

  const fields: FormField[] = [
    {
      name: "DAppNode Package name",
      placeholder: "i.e. yourpackage.public.dappnode.eth",
      value: dnpName,
      onValueChange: setDnpName,
      validations: [
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
                  message: `Repo already deployed at: ${repoAddresses.repoAddress}`,
                }
              : {
                  isValid: true,
                  message: `New repo to be deployed for ${dnpName}`,
                }
            : {
                isValid: false,
                message: `No valid registry found for ${dnpName}`,
              }
          : null,
      ],
    },
    {
      name: "Developer address",
      placeholder: "i.e. 0x0000000000000000000000000000000000000000",
      value: developerAddress,
      onValueChange: setDeveloperAddress,
      validations: [
        developerAddress
          ? ethers.isAddress(developerAddress)
            ? { isValid: true, message: "Valid address" }
            : { isValid: false, message: "Must be a valid ethereum address" }
          : null,
      ],
    },
    {
      name: "Next version",
      placeholder: "i.e. 0.1.7",
      value: version,
      onValueChange: setVersion,
      validations: [
        version
          ? semver.valid(version)
            ? { isValid: true, message: "Valid semver" }
            : { isValid: false, message: "Invalid semver" }
          : null,
        version && latestVersion
          ? isValidBump(latestVersion, version)
            ? { isValid: true, message: `Valid bump from ${latestVersion}` }
            : { isValid: false, message: "Next version is not a valid bump" }
          : null,
      ],
    },
    {
      name: "Release hash",
      placeholder: "i.e. /ipfs/QmVeaz5kR55nAiGjYpXpUAJpWvf6net4MbGFNjBfMTS8xS",
      value: releaseHash,
      onValueChange: setReleaseHash,
      validations: [
        releaseHash
          ? isIpfsHash(releaseHash)
            ? { isValid: true, message: "Valid ipfs hash" }
            : { isValid: false, message: "Invalid ipfs hash" }
          : null,
        manifest &&
        releaseHash &&
        releaseHash === manifest.hash &&
        manifest.name &&
        manifest.version
          ? manifest.name === dnpName && manifest.version === version
            ? { isValid: true, message: "Manifest successfully verified" }
            : {
                isValid: false,
                message: `Manifest verification failed. This manifest is for ${manifest.name} @ ${manifest.version}`,
              }
          : null,
      ],
    },
  ];

  const errors: string[] = fields
    .flatMap((field) => field.validations)
    .filter((validation) => validation !== null && !validation?.isValid)
    .map((validation) => validation?.message ?? "");

  return (
    <BaseCard
      hasBack={() => {
        stepper.setter(stepper.state - 1);
      }}
    >
      <Title title={"1. Release Details"} />
      <p>
        Fulfill the following form with the information of your package release.
      </p>
      {fields.map((field, i) => {
        const validations = (field.validations || []).filter(notNullish);
        const success = validations.filter((v) => v && v.isValid);
        const errors = validations.filter((v) => v && !v.isValid);
        return (
          <div key={i}>
            <Input
              key={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={field.value}
              error={errors.length > 0}
              success={success.length > 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.onValueChange(e.target.value)
              }
            ></Input>
            {field.validations &&
              field.validations.map((validation, i) =>
                validation ? (
                  <div
                    key={i}
                    className={`mt-2 text-xs ${
                      validation.isValid ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {validation.message}
                  </div>
                ) : null,
              )}
          </div>
        );
      })}
      <Button
        onClick={() => stepper.setter(stepper.state + 1)}
        disabled={
          errors.length > 0 ||
          dnpName === "" ||
          version === "" ||
          releaseHash === ""
        }
      >
        Next
      </Button>
    </BaseCard>
  );
}
