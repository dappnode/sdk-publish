import Header from "components/newComponents/Header";
import CheckAndPublish from "components/newComponents/steps/CheckAndPublishStep";
import ConnectAndSignStep from "components/newComponents/steps/ConnectAndSignStep";
import IntroductionStep from "components/newComponents/steps/IntroductionStep";
import IpfsSettingsStep from "components/newComponents/steps/IpfsSettingsStep";
import ReleaseFormStep from "components/newComponents/steps/ReleaseFormStep";
import ReleasePublished from "components/newComponents/steps/ReleasePublished";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { readIpfsApiUrls } from "settings";
import { RequestStatus } from "types";
import { parseUrlQuery } from "utils/urlQuery";

export function App() {
  const [stepper, setStepper] = useState(0);

  const [dnpName, setDnpName] = useState("");
  const [version, setVersion] = useState("");
  const [developerAddress, setDeveloperAddress] = useState("");
  const [releaseHash, setReleaseHash] = useState("");
  const [signedReleaseHash, setSignedReleaseHash] = useState<string | null>(
    null,
  );

  const [metamaskAddress, setMetamaskAddress] = useState("");

  const [providerReq, setProviderReq] = useState<
    RequestStatus<ethers.BrowserProvider>
  >({});

  const [publishReqStatus, setPublishReqStatus] = useState<
    RequestStatus<string>
  >({});

  const [isAllowedAddress, setIsAllowedAddress] = useState<boolean | null>(
    null,
  );
  // Precomputed variables
  const provider = providerReq.result;

  const [ipfsApiUrls, setIpfsApiUrls] = useState(readIpfsApiUrls());

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
      // 1. Release Form
      // 2. Connect Wallet and sign
      // 3. Edit IPFS settings
      // 4. check and publish
      // 4. release published
      case 0:
        return (
          <IntroductionStep
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
          />
        );
      case 1:
        return (
          <ReleaseFormStep
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
            dnpName={dnpName}
            setDnpName={setDnpName}
            developerAddress={developerAddress}
            setDeveloperAddress={setDeveloperAddress}
            version={version}
            setVersion={setVersion}
            releaseHash={releaseHash}
            setReleaseHash={setReleaseHash}
          />
        );
      case 2:
        return (
          <ConnectAndSignStep
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
            provider={provider}
            providerReq={providerReq}
            setProviderReq={setProviderReq}
            releaseHash={releaseHash}
            setSignedReleaseHash={setSignedReleaseHash}
            metamaskAddress={metamaskAddress}
            setMetamaskAddress={setMetamaskAddress}
            isAllowedAddress={isAllowedAddress}
            setIsAllowedAddress={setIsAllowedAddress}
            dnpName={dnpName}
          />
        );
      case 3:
        return (
          <IpfsSettingsStep
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
            ipfsApiUrls={ipfsApiUrls}
            setIpfsApiUrls={setIpfsApiUrls}
          />
        );
      case 4:
        return (
          <CheckAndPublish
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
            dnpName={dnpName}
            devAddress={developerAddress}
            version={version}
            releaseHash={releaseHash}
            signedReleaseHash={signedReleaseHash!}
            provider={provider}
            metamaskAddress={metamaskAddress}
            developerAddress={developerAddress}
            isAllowedAddress={isAllowedAddress}
            setIsAllowedAddress={setIsAllowedAddress}
            publishReqStatus={publishReqStatus}
            setPublishReqStatus={setPublishReqStatus}
          />
        );
      case 5:
        return (
          <ReleasePublished
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
            publishReqStatus={publishReqStatus}
          />
        );
    }
  }
  return (
    <div className="flex h-screen w-screen flex-col overflow-y-clip">
      <Header />
      <div className=" flex h-full flex-col items-center bg-background-color">
        {Steps()}
      </div>
    </div>
  );
}
