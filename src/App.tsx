import Header from "components/Header";
import ConnectWalletStep from "components/steps/ConnectWalletStep";
import IntroductionStep from "components/steps/IntroductionStep";
import IpfsSettingsStep from "components/steps/IpfsSettingsStep";
import ReleaseFormStep from "components/steps/ReleaseFormStep";
import ReleasePublished from "components/steps/ReleasePublished";
import SignAndPublish from "components/steps/SignAndPublishStep";
import { ethers } from "ethers";
import { DEFAULT_IPFS_API, DEFAULT_IPFS_GATEWAY } from "params";
import React, { useEffect, useState } from "react";
import { readIpfsApiUrls, readIpfsGatewayUrl } from "settings";
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

  useEffect(() => {
    //Check if wallet already connected
    const getWallet = async () => {
      const addresses: string[] = await window.ethereum.request({
        method: "eth_accounts",
      });
      console.log(`addresses is ${addresses}`);
      if (addresses.length > 0) {
        setProviderReq({ loading: true });
        setIsConnected(true);
        setProviderReq({
          result: new ethers.BrowserProvider(window.ethereum),
          loading: false,
        });
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });

          setAccount(addresses[0]);
          if (chainId === "0x1") {
            setIsMainnet(true);
            setStepper(2);
          }
        } catch (e) {
          setProviderReq({ error: e as Error, loading: false });
          console.error("Error fetching chainId:", e);
        }
      }
    };

    if (window.ethereum) {
      getWallet();
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

      // connect, disconnect and message events are not tested due couldn't be triggered
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
      window.ethereum.on("connect", (connectInfo: { chainId: string }) => {
        console.log("event connect", connectInfo);
        setIsConnected(true);
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts: string[]) => {
            console.log("accounts", accounts);
            // store it in state
            console.log(`1`);
            setAccount(accounts[0]);
          })
          .catch((error: { message: string; code: number; data?: unknown }) =>
            console.log("error", error),
          );
        // 0x1 is mainnet's chainId in hex
        console.log(`connectInfo.chainId:`);
        console.log(connectInfo.chainId);
        if (connectInfo.chainId === "0x1") setIsMainnet(true);
      });
    }
  }, []);

  function Steps() {
    switch (stepper) {
      // STEPS:
      // 0. Introduction
      // 1. Connect wallet
      // 2. Edit IPFS settings
      // 3. ReleaseDetails check
      // 4. sign and publish
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
            providerReq={providerReq}
            setProviderReq={setProviderReq}
          />
        );

      case 2:
        return (
          <IpfsSettingsStep
            setStepper={setStepper}
            ipfsApiUrls={ipfsApiUrls}
            setIpfsApiUrls={setIpfsApiUrls}
            ipfsGatewayUrl={ipfsGatewayUrl}
            setIpfsGatewayUrl={setIpfsGatewayUrl}
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
            ipfsGatewayUrl={ipfsGatewayUrl}
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
