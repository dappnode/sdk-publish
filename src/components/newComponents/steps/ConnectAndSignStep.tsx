import { ErrorView } from "components/ErrorView";
import { LoadingView } from "components/LoadingView";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { parseIpfsApiUrls, readIpfsApiUrls, writeIpfsApiUrls } from "settings";
import { RequestStatus } from "types";
import { signRelease } from "utils/signRelease";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Title from "../Title";
import { apmRepoIsAllowed } from "utils/apmRepoIsAllowed";
import memoizee from "memoizee";
import { resolveDnpName } from "utils/resolveDnpName";

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
  dnpName: string;
  isAllowedAddress: boolean | null;
  setIsAllowedAddress: React.Dispatch<React.SetStateAction<boolean | null>>;
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
  dnpName,
  isAllowedAddress,
  setIsAllowedAddress,
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

  useEffect(() => {
    // Necessary code to refresh the userAddress
    // when user interacts with the metamask extension
    // @ts-ignore
    const ethereum = window.ethereum;
    if (ethereum)
      ethereum.on("accountsChanged", (accounts: string[]) => {
        console.log("new user account", accounts[0]);
        setMetamaskAddress(accounts[0]);
      });
  }, []);

  const resolveDnpNameMem = memoizee(resolveDnpName, { promise: true });

  //Checks if the walllet address is whitelisted to publish
  useEffect(() => {
    if (dnpName && metamaskAddress && provider) {
      (async () => {
        if (!provider) throw Error(`Must connect to Metamask first`);

        if (metamaskAddress) {
          const { repoAddress } = await resolveDnpNameMem(dnpName, provider);
          if (repoAddress) {
            setIsAllowedAddress(
              await apmRepoIsAllowed(repoAddress, metamaskAddress, provider),
            );
          }
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metamaskAddress]);

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
      stepper.setter(4);
    } catch (e) {
      console.error(e);
      setSignReq({ error: e as Error });
    }
  }

  return (
    <BaseCard hasBack={() => stepper.setter(stepper.state - 1)}>
      <Title title={"2. Connect to your wallet and sign the release"} />
      <div
        onClick={() => stepper.setter(3)}
        className="w-fit  cursor-pointer text-text-purple transition-all duration-300 ease-in-out hover:tracking-wide hover:underline"
      >
        Edit IPFS Settings
      </div>
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
              <div className="text-sm text-error-red">
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

            {isAllowedAddress === false && (
              <div className="text-error-red">
                This wallet address is not allowed to publish in this repo.
                Change to an allowed account to continue
              </div>
            )}
            <Button
              onClick={doSignRelease}
              disabled={signReq.loading || !isAllowedAddress}
            >
              Sign release
            </Button>
          </>
        )
      )}
    </BaseCard>
  );
}
