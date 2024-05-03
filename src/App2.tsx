import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RequestStatus } from "types";
import { parseUrlQuery } from "utils/urlQuery";
import Header from "components/newComponents/Header";
import IntroductionStep from "components/newComponents/steps/IntroductionStep";
import ReleaseFormStep from "components/newComponents/steps/ReleaseFormStep";
import ConnectAndSignStep from "components/newComponents/steps/ConnectAndSignStep";
import { readIpfsApiUrls } from "settings";
import IpfsSettingsStep from "components/newComponents/steps/IpfsSettingsStep";

export function App() {
  const [stepper, setStepper] = useState(3);

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

  const [ipfsApiUrls, setIpfsApiUrls] = useState(readIpfsApiUrls());

  const provider = providerReq.result;

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
      // 4. Release checking / publish
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
        return <p>aquest es el pas 4</p>;
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
