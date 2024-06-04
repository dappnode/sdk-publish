import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import semver from "semver";
import { FormField, Manifest, RepoAddresses } from "types";
import { fetchManifest } from "utils/fetchManifest";
import { getLatestVersion } from "utils/getLatestVersion";
import { isIpfsHash } from "utils/isIpfsHash";
import { isValidBump } from "utils/isValidBump";
import { isValidEns } from "utils/isValidEns";
import { notNullish } from "utils/notNullish";
import { resolveDnpName } from "utils/resolveDnpName";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Input from "../Input";
import Title from "../Title";

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
  ipfsGatewayUrl: string;
  repoAddresses: RepoAddresses | undefined;
  setRepoAddresses: React.Dispatch<
    React.SetStateAction<RepoAddresses | undefined>
  >;
  account: string | null;
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
  ipfsGatewayUrl,
  repoAddresses,
  setRepoAddresses,
  account,
}: ReleaseFormProps) {
  const [latestVersion, setLatestVersion] = useState<string>();
  const [manifest, setManifest] = useState<
    (Manifest & { hash: string }) | null
  >();

  const [showDevAddressModal, setShowDevAddressModal] = useState(false);
  const [devAddressCheck, setDevAddressCheck] = useState(false);

  useEffect(() => {
    async function checkManifest(hash: string) {
      console.log(`errors lenght: ${errors.length}`);
      try {
        const manifest = await fetchManifest(hash, ipfsGatewayUrl);
        setManifest({ ...manifest, hash });
      } catch (e) {
        console.error(`Error fetching manifest ${hash}`, e);
        setManifest(null);
      }
    }

    checkManifest(releaseHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseHash]);

  useEffect(() => {
    async function checkDnpName(repoName: string, provider: ethers.Provider) {
      try {
        const repoAddress = await resolveDnpName(repoName, provider);
        setRepoAddresses(repoAddress);
      } catch (e) {
        console.error(`Error resolving dnpName ${repoName}`, e);
      }
    }

    if (isValidEns(dnpName)) checkDnpName(dnpName, provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dnpName, provider]);

  useEffect(() => {
    async function checkLatestVersion(repoName: string, provider: any) {
      try {
        const latestVersion = await getLatestVersion(repoName, provider);
        setLatestVersion(latestVersion);
      } catch (e) {
        console.error(`Error getting latest version of ${repoName}`, e);
      }
    }

    if (semver.valid(version) && isValidEns(dnpName))
      checkLatestVersion(dnpName, provider);
  }, [dnpName, version, provider]);

  // Form input variables
  const fields: FormField[] = [
    {
      name: "Dappnode Package name",
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
      warnings: [
        developerAddress
          ? developerAddress.toLowerCase() === account?.toLowerCase()
            ? {
                isValid: true,
                message: "Developer address is the same the one publishing",
              }
            : {
                isValid: false,
                message: "Developer address different from the one publishing",
              }
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
            : {
                isValid: false,
                message: `Next version is not a valid bump from ${latestVersion}`,
              }
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
        releaseHash
          ? manifest
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
              }
          : null,
      ],
    },
  ];

  const errors: string[] = fields
    .flatMap((field) => field.validations)
    .filter((validation) => validation !== null && !validation?.isValid)
    .map((validation) => validation?.message ?? "");

  const handleNext = () => {
    if (
      !developerAddress ||
      developerAddress.toLowerCase() === account?.toLowerCase()
    ) {
      setStepper((prevState) => prevState + 1);
    } else {
      setShowDevAddressModal(true);
    }
  };

  function DevAddressWarningModal() {
    return (
      <div className="absolute left-0 top-0 z-10 flex h-screen w-screen items-center justify-center bg-black/80">
        <BaseCard className="m-0">
          <Title title={"⚠️ Developer Address Warning ⚠️"} />
          <p className="font-poppins">
            Setting a developer address will restrict future releases when
            publishing. Read this before going forward:
          </p>
          <ul className="flex list-disc flex-col gap-5 pl-5 font-poppins marker:text-text-purple">
            <li>
              Only the specified developer address will be able to publish new
              versions of this package.
            </li>
            <li>
              If you lose access to the developer address,{" "}
              <b>the package could become "orphaned" </b> , making it impossible
              to publish new versions.
            </li>
          </ul>
          <div className="flex flex-row gap-3">
            <input
              type="checkbox"
              className="h-5 w-5 accent-text-purple"
              onChange={() => setDevAddressCheck(!devAddressCheck)}
              checked={devAddressCheck}
            />{" "}
            <p>I undestrand the risks of setting a developer address</p>
          </div>

          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Button onClick={() => setShowDevAddressModal(false)}>
                Go back
              </Button>
            </div>
            <div className="w-1/2 ">
              <Button
                disabled={!devAddressCheck}
                onClick={() => setStepper((prevState) => prevState + 1)}
              >
                Continue anyway
              </Button>
            </div>
          </div>
        </BaseCard>
      </div>
    );
  }
  return (
    <>
      {showDevAddressModal && DevAddressWarningModal()}
      <BaseCard
        hasBack={() => {
          setStepper((prevState) => prevState - 1);
        }}
      >
        <Title title={"3. Release Details"} />
        <p>
          Fulfill the following form with the information of your package
          release.
        </p>
        {fields.map((field, i) => {
          const validations = (field.validations || []).filter(notNullish);
          const warnings = (field.warnings || []).filter(notNullish);
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
                warning={warnings.length > 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onValueChange(e.target.value)
                }
              ></Input>
              {field.validations &&
                field.validations.map(
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
                    ),
                )}
              {field.warnings &&
                field.warnings.map(
                  (warning, i) =>
                    warning && (
                      <div
                        key={i}
                        className={`mt-2 text-xs ${
                          warning.isValid ? "text-error-red" : "text-yellow-600"
                        }`}
                      >
                        {warning.message}
                      </div>
                    ),
                )}
            </div>
          );
        })}
        <Button
          onClick={handleNext}
          disabled={
            errors.length > 0 ||
            !dnpName ||
            !version ||
            !releaseHash ||
            !repoAddresses
          }
        >
          Next
        </Button>
      </BaseCard>
    </>
  );
}
