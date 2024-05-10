import { ethers } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import semver from "semver";
import { FormField, Manifest, RepoAddresses } from "types";
import { isIpfsHash } from "utils/isIpfsHash";
import { isValidEns } from "utils/isValidEns";
import { notNullish } from "utils/notNullish";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Input from "../Input";
import Title from "../Title";
import { isValidBump } from "utils/isValidBump";
import memoizee from "memoizee";
import { fetchManifest } from "utils/fetchManifest";
import { resolveDnpName } from "utils/resolveDnpName";
import { getLatestVersion } from "utils/getLatestVersion";
import { debounce } from "lodash";
import { IPFS_GATEWAY } from "params";
import { fetchReleaseSignature } from "utils/fetchRelease";

interface ReleaseFormProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  dnpName: string;
  setDnpName: React.Dispatch<React.SetStateAction<string>>;
  developerAddress: string;
  setDeveloperAddress: React.Dispatch<React.SetStateAction<string>>;
  version: string;
  setVersion: React.Dispatch<React.SetStateAction<string>>;
  releaseHash: string;
  setReleaseHash: React.Dispatch<React.SetStateAction<string>>;
  provider: any;
}

export default function ReleaseForm({
  setStepper,
  dnpName,
  setDnpName,
  developerAddress,
  setDeveloperAddress,
  version,
  setVersion,
  releaseHash,
  setReleaseHash,
  provider,
}: ReleaseFormProps) {
  const [repoAddresses, setRepoAddresses] = useState<RepoAddresses>();
  const [latestVersion, setLatestVersion] = useState<string>();
  const [manifest, setManifest] = useState<Manifest & { hash: string }>();

  const fetchManifestMem = memoizee(fetchManifest, { promise: true });
  const resolveDnpNameMem = memoizee(resolveDnpName, { promise: true });
  const getLatestVersionMem = memoizee(getLatestVersion, { promise: true });

  const onNewManifestHash = useMemo(
    () =>
      debounce(async (hash: string) => {
        fetchManifestMem(hash, IPFS_GATEWAY)
          .then((manifest) => setManifest({ ...manifest, hash }))
          .catch((e) => console.error(`Error fetching manifest ${hash}`, e));

        try {
          await fetchReleaseSignature(hash, IPFS_GATEWAY);
        } catch (e) {
          console.error(`Error fetching release ${hash}`, e);
        }
      }, 500),
    [],
  );
  const onNewDnpName = useMemo(
    () =>
      debounce((dnpName: string, provider: ethers.Provider) => {
        console.log("ON NEW DNP", dnpName);
        resolveDnpNameMem(dnpName, provider)
          .then(setRepoAddresses)
          .catch((e) => console.error(`Error resolving dnpName ${dnpName}`, e));
        getLatestVersionMem(dnpName, provider)
          .then(setLatestVersion)
          .catch((e) => console.error(`Error get latest ver ${dnpName}`, e));
      }, 500),
    [],
  );

  useEffect(() => {
    if (releaseHash) onNewManifestHash(releaseHash);
  }, [releaseHash, onNewManifestHash]);

  useEffect(() => {
    if (dnpName && isValidEns(dnpName) && provider)
      onNewDnpName(dnpName, provider);
  }, [dnpName, provider, onNewDnpName]);
  // Form input variables
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
        manifest
          ? manifest.name && manifest.version
            ? manifest.name === dnpName && manifest.version === version
              ? { isValid: true, message: "Manifest successfully verified" }
              : {
                  isValid: false,
                  message: `Manifest verification failed. This manifest is for ${manifest.name} @ ${manifest.version}`,
                }
            : {
                isValid: false,
                message: `Manifest's name or version not found in this hash`,
              }
          : {
              isValid: false,
              message: `Hash or manifest not found`,
            },
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
        setStepper((prevState) => prevState - 1);
      }}
    >
      <Title title={"3. Release Details"} />
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
                      validation.isValid
                        ? "text-success-green"
                        : "text-error-red"
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
        onClick={() => setStepper((prevState) => prevState + 1)}
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
