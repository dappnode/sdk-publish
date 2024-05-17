import Header from "components/newComponents/Header";
import ConnectWalletStep from "components/newComponents/steps/ConnectWalletStep";
import IntroductionStep from "components/newComponents/steps/IntroductionStep";
import IpfsSettingsStep from "components/newComponents/steps/IpfsSettingsStep";
import ReleaseFormStep from "components/newComponents/steps/ReleaseFormStep";
import ReleasePublished from "components/newComponents/steps/ReleasePublished";
import SignAndPublish from "components/newComponents/steps/SignAndPublishStep";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { readIpfsApiUrls, readIpfsGatewayUrls } from "settings";
import { RequestStatus } from "types";
import { parseUrlQuery } from "utils/urlQuery";

export function App() {
  const [stepper, setStepper] = useState(0);

  //Release states
  const [dnpName, setDnpName] = useState("");
  const [version, setVersion] = useState("");
  const [developerAddress, setDeveloperAddress] = useState("");
  const [releaseHash, setReleaseHash] = useState("");

  //Wallet states
  const [isConnected, setIsConnected] = useState(false);
  const [isMainnet, setIsMainnet] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const [providerReq, setProviderReq] = useState<
    RequestStatus<ethers.BrowserProvider>
  >({});

  const [publishReqStatus, setPublishReqStatus] = useState<
    RequestStatus<string>
  >({});

  // Precomputed variables
  const provider = providerReq.result;

  const [ipfsApiUrls, setIpfsApiUrls] = useState(readIpfsApiUrls());
  const [ipfsGatewayUrls, setIpfsGatewayUrls] = useState(readIpfsGatewayUrls());

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

  useEffect(() => {
    //window ethereum EIP: https://eips.ethereum.org/EIPS/eip-1193
    window.ethereum.on("chainChanged", (chainId: string) => {
      console.log("event chainChanged: ", chainId);
      window.location.reload();
    });
    window.ethereum.on("accountsChanged", (accounts: Array<string>) => {
      console.log("event accountsChanged");
      console.log("accounts", accounts);
      setAccount(accounts[0]);
    });

    window.ethereum.on(
      "message",
      (message: { type: string; data: unknown }) => {
        console.log("event message", message);
      },
    );
    window.ethereum.on(
      "disconnect",
      (error: { message: string; code: number; data?: unknown }) => {
        console.log("disconnect", error);
        setIsConnected(false);
      },
    );
    // window.ethereum.on("connect", (connectInfo: { chainId: string }) => {
    //   console.log("event connect", connectInfo);
    //   setIsConnected(true);
    //   window.ethereum
    //     .request({ method: "eth_requestAccounts" })
    //     .then((accounts: string[]) => {
    //       console.log("accounts", accounts);
    //       // store it in state
    //       console.log(`1`);
    //       setAccount(accounts[0]);
    //     })
    //     .catch((error: { message: string; code: number; data?: unknown }) =>
    //       console.log("error", error),
    //     );
    //   // 0x1 is mainnet's chainId in hex
    //   console.log(`connectInfo.chainId:`);
    //   console.log(connectInfo.chainId);
    //   if (connectInfo.chainId === "0x1") setIsMainnet(true);
    // });
  }, []);

  function Steps() {
    switch (stepper) {
      // STEPS:
      // 0. Introduction
      // 1. Connect wallet
      // 2. Edit IPFS settings
      // 3. ReleaseDetails and sign
      // 4. check and publish
      // 5. release published
      case 0:
        return <IntroductionStep setStepper={setStepper} />;
      case 1:
        return (
          <ConnectWalletStep
            setStepper={setStepper}
            account={account}
            setAccount={setAccount}
            isMainnet={isMainnet}
            setIsMainnet={setIsMainnet}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            provider={window.ethereum}
            setProviderReq={setProviderReq}
          />
        );

      case 2:
        return (
          <IpfsSettingsStep
            setStepper={setStepper}
            ipfsApiUrls={ipfsApiUrls}
            setIpfsApiUrls={setIpfsApiUrls}
            ipfsGatewayUrls={ipfsGatewayUrls}
            setIpfsGatewayUrls={setIpfsGatewayUrls}
          />
        );
      case 3:
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
          />
        );
      case 4:
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
            ipfsGatewayUrls={ipfsGatewayUrls}
          />
        );
      case 6:
        return (
          <ReleasePublished
            setStepper={setStepper}
            publishReqStatus={publishReqStatus}
          />
        );
    }
  }
  return (
    <div className="flex h-screen w-screen flex-col overflow-y-clip">
      <Header account={account} />
      <div className=" flex h-full flex-col items-center bg-background-color">
        {Steps()}
      </div>
    </div>
  );
}
