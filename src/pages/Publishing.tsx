import { ethers } from "ethers";
import { DEFAULT_IPFS_API, DEFAULT_IPFS_GATEWAY } from "params";
import React, { useEffect, useState } from "react";
import { readIpfsApiUrls, readIpfsGatewayUrl } from "settings";
import { RepoAddresses, RequestStatus } from "types";
import { parseUrlQuery } from "utils/urlQuery";
import IntroductionStep from "components/steps/IntroductionStep";
import IpfsSettingsStep from "components/steps/IpfsSettingsStep";
import ReleaseFormStep from "components/steps/ReleaseFormStep";
import ReleasePublished from "components/steps/ReleasePublished";
import SignAndPublish from "components/steps/SignAndPublishStep";

interface PublishingProps {
  account: string | null;
  provider: ethers.BrowserProvider | undefined;
}

export function Publishing({ account, provider }: PublishingProps) {
  const [stepper, setStepper] = useState(0);

  //Release states
  const [dnpName, setDnpName] = useState("");
  const [version, setVersion] = useState("");
  const [developerAddress, setDeveloperAddress] = useState("");
  const [releaseHash, setReleaseHash] = useState("");

  const [repoAddresses, setRepoAddresses] = useState<RepoAddresses>();

  const [publishReqStatus, setPublishReqStatus] = useState<RequestStatus<string>>({});

  const [ipfsApiUrls, setIpfsApiUrls] = useState(
    readIpfsApiUrls() === "" ? DEFAULT_IPFS_API : readIpfsApiUrls(),
  );
  const [ipfsGatewayUrl, setIpfsGatewayUrl] = useState(
    readIpfsGatewayUrl() === "" ? DEFAULT_IPFS_GATEWAY : readIpfsGatewayUrl(),
  );

  // Set state based on URL parameters
  useEffect(() => {
    const urlParams = parseUrlQuery(window.location.search);
    console.log("URL params", urlParams);

    if (urlParams.r) setDnpName(urlParams.r);
    if (urlParams.v) setVersion(urlParams.v);
    if (urlParams.d) setDeveloperAddress(urlParams.d);
    if (urlParams.h) setReleaseHash(urlParams.h);

    // Check if any URL parameter exists, then set the stepper
    if (urlParams.r || urlParams.v || urlParams.d || urlParams.h) {
      setStepper(1);
    }
  }, []);

  function Steps() {
    switch (stepper) {
      // STEPS:
      // 0. Introduction
      // 1. Edit IPFS settings
      // 2. ReleaseDetails check
      // 3. sign and publish
      // 4. release published
      case 0:
        return <IntroductionStep setStepper={setStepper} />;
      case 1:
        return (
          <IpfsSettingsStep
            setStepper={setStepper}
            ipfsApiUrls={ipfsApiUrls}
            setIpfsApiUrls={setIpfsApiUrls}
            ipfsGatewayUrl={ipfsGatewayUrl}
            setIpfsGatewayUrl={setIpfsGatewayUrl}
          />
        );
      case 2:
        return (
          <ReleaseFormStep
            setStepper={setStepper}
            dnpName={dnpName}
            setDnpName={setDnpName}
            developerAddress={developerAddress}
            setDeveloperAddress={setDeveloperAddress}
            version={version}
            setVersion={setVersion}
            releaseHash={releaseHash}
            setReleaseHash={setReleaseHash}
            provider={provider}
            ipfsGatewayUrl={ipfsGatewayUrl}
            repoAddresses={repoAddresses}
            setRepoAddresses={setRepoAddresses}
            account={account}
          />
        );
      case 3:
        return (
          <SignAndPublish
            setStepper={setStepper}
            dnpName={dnpName}
            devAddress={developerAddress}
            version={version}
            releaseHash={releaseHash}
            provider={provider}
            account={account}
            developerAddress={developerAddress}
            publishReqStatus={publishReqStatus}
            setPublishReqStatus={setPublishReqStatus}
            ipfsApiUrls={ipfsApiUrls}
            ipfsGatewayUrl={ipfsGatewayUrl}
          />
        );
      case 4:
        return (
          <ReleasePublished
            setStepper={setStepper}
            publishReqStatus={publishReqStatus}
            repoAddresses={repoAddresses}
          />
        );
    }
  }

  return (
    <div className="flex h-full flex-col items-center pb-5">
      {Steps()}
    </div>
  );
} 