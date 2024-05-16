import React, { useEffect, useState } from "react";
import { ReleaseDetails, RequestStatus } from "types";
import { notNullish } from "utils/notNullish";
import BaseCard from "../BaseCard";
import Title from "../Title";

import { ErrorView } from "components/ErrorView";
import { LoadingView } from "components/LoadingView";
import { ethers } from "ethers";
import memoizee from "memoizee";
import { parseIpfsUrls } from "settings";
import { apmRepoIsAllowed } from "utils/apmRepoIsAllowed";
import { executePublishTx } from "utils/executePublishTx";
import { resolveDnpName } from "utils/resolveDnpName";
import { signRelease } from "utils/signRelease";
import Button from "../Button";
import { DEFAULT_IPFS_API } from "params";

interface SignAndPublishProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
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
  setStepper,
  dnpName,
  devAddress,
  version,
  releaseHash,
  provider,
  account,
  developerAddress,
  publishReqStatus,
  setPublishReqStatus,
  ipfsApiUrls,
}: SignAndPublishProps) {
  const [signedReleaseHash, setSignedReleaseHash] = useState<string>("");

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
  }, [account, dnpName, provider, resolveDnpNameMem]);

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
    },
  ];

  async function doSignRelease() {
    try {
      setSignReq({ loading: true });
      // newReleaseHash is not prefixed by '/ipfs/'
      const newReleaseHash = await signRelease(
        releaseHash,
        parseIpfsUrls(ipfsApiUrls ? ipfsApiUrls : DEFAULT_IPFS_API),
      );
      setSignReq({ result: newReleaseHash });
      setSignedReleaseHash(`/ipfs/${newReleaseHash}`);
      setIsSigned(true);
    } catch (e) {
      console.error(e);
      setSignReq({ error: e as Error });
      setIsSigned(false);
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
      setStepper((prevState) => prevState + 1);
    } catch (e) {
      console.error(e);
      setPublishReqStatus({ error: e as Error });
    }
  }

  return (
    <BaseCard hasBack={() => setStepper((prevState) => prevState - 1)}>
      <Title title={"4. Sign and Publish"} />
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
      {!isAllowedAddress ? (
        <div className="text-error-red">
          The address {account}is not allowed to publish in this repo. Change to
          an allowed account to continue
        </div>
      ) : !isSigned ? (
        <p className="text-center text-success-green">
          The release is ready to be signed
        </p>
      ) : (
        <p className="text-center text-success-green">
          The release is ready to be published
        </p>
      )}
      {!isSigned ? (
        <Button
          onClick={doSignRelease}
          disabled={signReq.loading || !isAllowedAddress}
        >
          Sign release
        </Button>
      ) : (
        <Button
          onClick={publish}
          disabled={publishReqStatus.loading || !isSigned || !isAllowedAddress}
        >
          Publish
        </Button>
      )}
    </BaseCard>
  );
}
