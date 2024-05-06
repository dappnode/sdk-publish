import React, { useEffect, useMemo, useState } from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";
import { Manifest, ReleaseDetails, RepoAddresses, RequestStatus } from "types";
import { notNullish } from "utils/notNullish";

import memoizee from "memoizee";
import { debounce } from "lodash";
import { IPFS_GATEWAY } from "params";
import { fetchReleaseSignature } from "utils/fetchRelease";
import { fetchManifest } from "utils/fetchManifest";
import { resolveDnpName } from "utils/resolveDnpName";
import { getLatestVersion } from "utils/getLatestVersion";
import { ethers } from "ethers";
import { isValidBump } from "utils/isValidBump";
import Button from "../Button";
import { apmRepoIsAllowed } from "utils/apmRepoIsAllowed";
import { executePublishTx } from "utils/executePublishTx";
import { LoadingView } from "components/LoadingView";
import { ErrorView } from "components/ErrorView";

interface CheckAndPublishProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
  dnpName: string;
  devAddress: string;
  version: string;
  releaseHash: string;
  signedReleaseHash: string;
  provider: ethers.BrowserProvider | undefined;
  metamaskAddress: string;
  developerAddress: string;
  isAllowedAddress: boolean | null;
  setIsAllowedAddress: React.Dispatch<React.SetStateAction<boolean | null>>;
  publishReqStatus: RequestStatus<string>;
  setPublishReqStatus: React.Dispatch<
    React.SetStateAction<RequestStatus<string>>
  >;
}

export default function CheckAndPublish({
  stepper,
  dnpName,
  devAddress,
  version,
  releaseHash,
  signedReleaseHash,
  provider,
  metamaskAddress,
  developerAddress,
  isAllowedAddress,
  setIsAllowedAddress,
  publishReqStatus,
  setPublishReqStatus,
}: CheckAndPublishProps) {
  const [manifest, setManifest] = useState<Manifest & { hash: string }>();
  const [isSigned, setIsSigned] = useState<boolean | null>(null);
  const [repoAddresses, setRepoAddresses] = useState<RepoAddresses>();
  const [latestVersion, setLatestVersion] = useState<string>();

  const [areAllValid, setAreAllValid] = useState<boolean | null>(null);

  const details: ReleaseDetails[] = [
    {
      name: "Package Name",
      value: dnpName,
      validations: [
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
    { name: "Developer address", value: devAddress },
    {
      name: "Release version",
      value: version,
      validations: [
        version && latestVersion
          ? isValidBump(latestVersion, version)
            ? { isValid: true, message: `Valid bump from ${latestVersion}` }
            : { isValid: false, message: "Next version is not a valid bump" }
          : null,
      ],
    },
    {
      name: "Release hash",
      value: releaseHash,
      validations: [
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
    {
      name: "Signed Release hash",
      value: signedReleaseHash,
      validations: [
        isSigned && manifest
          ? signedReleaseHash && signedReleaseHash === manifest.hash
            ? {
                isValid: true,
                message: "Signed release hash successfully verified",
              }
            : {
                isValid: false,
                message: `Signed release hash verification failed. Its manifest hash is ${manifest.hash}`,
              }
          : null,
      ],
    },
  ];

  const fetchManifestMem = memoizee(fetchManifest, { promise: true });
  const resolveDnpNameMem = memoizee(resolveDnpName, { promise: true });
  const getLatestVersionMem = memoizee(getLatestVersion, { promise: true });

  // Check manifest for manifestHash

  const onNewManifestHash = useMemo(
    () =>
      debounce(async (hash: string) => {
        fetchManifestMem(hash, IPFS_GATEWAY)
          .then((manifest) => setManifest({ ...manifest, hash }))
          .catch((e) => console.error(`Error fetching manifest ${hash}`, e));

        try {
          await fetchReleaseSignature(hash, IPFS_GATEWAY);
          setIsSigned(true);
        } catch (e) {
          console.error(`Error fetching release ${hash}`, e);
          setIsSigned(false);
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
    onNewManifestHash(signedReleaseHash);
    if (provider) onNewDnpName(dnpName, provider);
  }, []);

  useEffect(() => {
    const allValidations = details
      .map((detail) => (detail.validations || []).filter(notNullish))
      .flat()
      .every((validation) => validation.isValid);

    setAreAllValid(allValidations);
  }, [details]);

  async function publish() {
    try {
      if (!dnpName) throw Error("Must provide a dnpName");
      if (!version) throw Error("Must provide a version");
      if (!signedReleaseHash) throw Error("Must provide a manifestHash");

      setPublishReqStatus({ loading: true });

      if (!provider) throw Error(`Must connect to Metamask first`);
      const network = await provider.getNetwork();

      if (network && String(network.chainId) !== "1")
        throw Error("Transactions must be published on Ethereum Mainnet");

      if (metamaskAddress) {
        const { repoAddress } = await resolveDnpNameMem(dnpName, provider);
        if (repoAddress) {
          setIsAllowedAddress(
            await apmRepoIsAllowed(repoAddress, metamaskAddress, provider),
          );
          if (!isAllowedAddress)
            throw Error(
              `Selected address ${metamaskAddress} is not allowed to publish`,
            );
        }
      }

      const txHash = await executePublishTx(
        { dnpName, version, manifestHash: signedReleaseHash, developerAddress },
        provider,
      );
      setPublishReqStatus({ result: txHash });
    } catch (e) {
      console.error(e);
      setPublishReqStatus({ error: e as Error });
    }
  }

  return (
    <BaseCard hasBack={() => stepper.setter(2)}>
      <Title title={"3. Check and publish the release"} />
      <p>Double-check the release details and publish!</p>

      {details.map((detail, i) => {
        const validations = (detail.validations || []).filter(notNullish);
        const success = validations.filter((v) => v && v.isValid);
        const errors = validations.filter((v) => v && !v.isValid);
        return (
          <>
            <div>
              <div className="flex flex-row text-sm" key={i}>
                <div className="w-1/4  text-text-purple">{detail.name}:</div>
                <div className="w-3/4">
                  {!detail.value ? "-" : detail.value}
                </div>
              </div>
              <div className="mt-1">
                {success.map((item, i) => (
                  <div key={i} className="text-success-green text-xs">
                    <div>{item.message}</div>
                  </div>
                ))}
                {errors.map((item, i) => (
                  <div key={i} className="text-xs text-error-red">
                    <div>{item.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })}
      {publishReqStatus.error && <ErrorView error={publishReqStatus.error} />}
      {publishReqStatus.loading && (
        <LoadingView steps={["Publishing release transaction"]} />
      )}

      {areAllValid ? (
        <>
          <p className="text-success-green">
            All checks have passed. The release is ready to be published
          </p>
          <Button onClick={publish}> Publish</Button>
        </>
      ) : (
        <>
          <p className="text-error-red">
            Some checks have not passed. Go back and modify the release details
          </p>
          <Button onClick={() => stepper.setter(1)}> Modify release</Button>
        </>
      )}
    </BaseCard>
  );
}
