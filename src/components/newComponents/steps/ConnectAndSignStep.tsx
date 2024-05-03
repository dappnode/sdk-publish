import React, { useEffect, useState } from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";
import Button from "../Button";
import { RequestStatus } from "types";
import { ethers } from "ethers";
import { parseIpfsApiUrls, readIpfsApiUrls, writeIpfsApiUrls } from "settings";
import { signRelease } from "utils/signRelease";
import { ErrorView } from "components/ErrorView";
import { LoadingView } from "components/LoadingView";

interface ConnectAndSignStepProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
  provider: ethers.BrowserProvider | undefined;
  providerReq: RequestStatus<ethers.BrowserProvider>;
  setProviderReq: React.Dispatch<
    React.SetStateAction<RequestStatus<ethers.BrowserProvider>>
  >;
  releaseHash: string;
  setSignedReleaseHash: React.Dispatch<React.SetStateAction<string | null>>;
  metamaskAddress: string;
  setMetamaskAddress: React.Dispatch<React.SetStateAction<string>>;
}

export default function ConnectAndSignStep({
  stepper,
  provider,
  providerReq,
  setProviderReq,
  releaseHash,
  setSignedReleaseHash,
  metamaskAddress,
  setMetamaskAddress,
}: ConnectAndSignStepProps) {
  const [ipfsApiUrls, setIpfsApiUrls] = useState(readIpfsApiUrls());
  // Persist apiUrls settings
  useEffect(() => writeIpfsApiUrls(ipfsApiUrls), [ipfsApiUrls]);
  const [signReq, setSignReq] = useState<RequestStatus<string>>({});
  const [showError, setShowError] = useState(false);

  //Sets the address when connecting to metamask
  useEffect(() => {
    async function setAccount() {
      if (provider) {
        const accounts = await provider.listAccounts();
        setMetamaskAddress(accounts[0].address);
      }
    }
    setAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerReq]);

  async function connectToMetamask() {
    try {
      setProviderReq({ loading: true });
      // Modern dapp browsers...
      if (window.ethereum) {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        setProviderReq({
          result: new ethers.BrowserProvider(window.ethereum),
        });
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        setProviderReq({
          result: new ethers.BrowserProvider(window.web3.currentProvider),
        });
      }
      // Non-dapp browsers...
      else {
        throw Error("Non-Ethereum browser detected. Please, install MetaMask");
      }
    } catch (e) {
      console.error(e);
      setProviderReq({ error: e as Error });
    }
  }

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
      //stepper.setter(stepper.state + 1);
    } catch (e) {
      console.error(e);
      setSignReq({ error: e as Error });
    }
  }
  return (
    <BaseCard hasBack={() => stepper.setter(stepper.state - 1)}>
      <Title title={"2. Connect to your wallet and sign the release"} />
      {!provider ? (
        <>
          <p>There is not any Metamask wallet linked yet!</p>
          <Button onClick={connectToMetamask} disabled={providerReq.loading}>
            Connect to wallet
          </Button>
        </>
      ) : (
        providerReq.result && (
          <>
            <p>
              Your current metamask addres is:{" "}
              <span className="tracking-wider text-text-purple">
                {metamaskAddress}
              </span>
            </p>
            {signReq.loading && <LoadingView steps={["Signing release"]} />}
            {signReq.error && (
              <div className="text-error-red text-sm">
                Error while trying to sign the release. For more information
                check the console or click{" "}
                <span
                  className="cursor-pointer text-text-purple underline transition-all duration-300 ease-in-out hover:tracking-widest"
                  onClick={() => setShowError(!showError)}
                >
                  here
                </span>
                {showError && (
                  <div className="mt-3 overflow-scroll text-xs">
                    <ErrorView error={signReq.error} />
                  </div>
                )}
              </div>
            )}

            <Button onClick={doSignRelease} disabled={signReq.loading}>
              Sign release
            </Button>
          </>
        )
      )}
    </BaseCard>
  );
}
