import React, { useEffect, useState } from "react";
import { Manifest, ReleaseDetails, RequestStatus } from "types";
import { notNullish } from "utils/notNullish";
import BaseCard from "../BaseCard";
import Title from "../Title";

import { ErrorView } from "components/ErrorView";
import { LoadingView } from "components/LoadingView";
import { ethers } from "ethers";
import memoizee from "memoizee";
import { parseIpfsApiUrls } from "settings";
import { apmRepoIsAllowed } from "utils/apmRepoIsAllowed";
import { executePublishTx } from "utils/executePublishTx";
import { resolveDnpName } from "utils/resolveDnpName";
import { signRelease } from "utils/signRelease";
import Button from "../Button";

interface SignAndPublishProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
  dnpName: string;
  devAddress: string;
  version: string;
  releaseHash: string;
  provider: ethers.BrowserProvider | undefined;
  account: string | null;
  developerAddress: string;
  publishReqStatus: RequestStatus<string>;
  setPublishReqStatus: React.Dispatch<
    React.SetStateAction<RequestStatus<string>>
  >;
  ipfsApiUrls: string;
}

export default function SignAndPublish({
  stepper,
  dnpName,
  devAddress,
  version,
  releaseHash,
  provider,
  account: account,
  developerAddress,
  publishReqStatus,
  setPublishReqStatus,
  ipfsApiUrls,
}: SignAndPublishProps) {
  const [signedReleaseHash, setSignedReleaseHash] = useState<string>("");

  const [manifest, setManifest] = useState<Manifest & { hash: string }>();
  const [isSigned, setIsSigned] = useState<boolean | null>(null);
  const [signReq, setSignReq] = useState<RequestStatus<string>>({});

  const [isAllowedAddress, setIsAllowedAddress] = useState<boolean | null>(
    null,
  );

  const resolveDnpNameMem = memoizee(resolveDnpName, { promise: true });

  //Checks if the wallet address is whitelisted to publish
  useEffect(() => {
    if (dnpName && account && provider) {
      (async () => {
        if (!provider) throw Error(`Must connect to Metamask first`);

        if (account) {
          const { repoAddress } = await resolveDnpNameMem(dnpName, provider);
          if (repoAddress) {
            setIsAllowedAddress(
              await apmRepoIsAllowed(repoAddress, account, provider),
            );
          }
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const details: ReleaseDetails[] = [
    {
      name: "Package Name",
      value: dnpName,
    },
    { name: "Developer address", value: devAddress },
    {
      name: "Release version",
      value: version,
    },
    {
      name: "Release hash",
      value: releaseHash,
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

  async function doSignRelease() {
    try {
      setSignReq({ loading: true });
      // newReleaseHash is not prefixed by '/ipfs/'
      const newReleaseHash = await signRelease(
        releaseHash,
        parseIpfsApiUrls(ipfsApiUrls),
      );
      setSignReq({ result: newReleaseHash });
      setSignedReleaseHash(`/ipfs/${newReleaseHash}`);
      stepper.setter(4);
    } catch (e) {
      console.error(e);
      setSignReq({ error: e as Error });
    }
  }

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

      if (account) {
        const { repoAddress } = await resolveDnpNameMem(dnpName, provider);
        if (repoAddress) {
          setIsAllowedAddress(
            await apmRepoIsAllowed(repoAddress, account, provider),
          );
          if (!isAllowedAddress)
            throw Error(
              `Selected address ${account} is not allowed to publish`,
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
      <Title title={"3. Sign and publish the release"} />
      <p>Double-check the release details to sign and publish!</p>

      {details.map((detail, i) => {
        const validations = (detail.validations || []).filter(notNullish);
        const success = validations.filter((v) => v && v.isValid);
        const errors = validations.filter((v) => v && !v.isValid);
        return (
          <>
            <div>
              <div className="flex flex-row text-sm" key={i}>
                <div className="mt-0.5  w-1/4 text-text-purple">
                  {detail.name}:
                </div>
                <p className="w-3/4">{!detail.value ? "-" : detail.value}</p>
              </div>
              <div className="mt-1">
                {success.map((item, i) => (
                  <div key={i} className="text-xs text-success-green">
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
      {!isAllowedAddress && (
        <div className="text-error-red">
          The address {account}is not allowed to publish in this repo. Change to
          an allowed account to continue
        </div>
      )}
      <Button
        onClick={doSignRelease}
        disabled={signReq.loading || !isAllowedAddress}
      >
        Sign release
      </Button>

      {/* {true ? (
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
      )} */}
    </BaseCard>
  );
}
