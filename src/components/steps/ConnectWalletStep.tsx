import React, { useEffect, useRef } from "react";
import BaseCard from "../BaseCard";
import ConnectWallet from "../ConnectWallet";
import { SwitchNetwork } from "../SwitchNetwork";
import Title from "../Title";
import Button from "../Button";
import { RequestStatus } from "types";
import { ethers } from "ethers";
import { LoadingView } from "components/LoadingView";
import { ErrorView } from "components/ErrorView";

interface ConnectWalletStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  isMainnet: boolean;
  setIsMainnet: React.Dispatch<React.SetStateAction<boolean>>;
  provider: any;
  providerReq: RequestStatus<ethers.BrowserProvider>;
  setProviderReq: (
    value: React.SetStateAction<RequestStatus<ethers.BrowserProvider>>,
  ) => void;
}

export default function ConnectWalletStep({
  setStepper,
  account,
  setAccount,
  isConnected,
  setIsConnected,
  isMainnet,
  setIsMainnet,
  provider,
  providerReq,
  setProviderReq,
}: ConnectWalletStepProps) {
  const prevIsMainnet = useRef(isMainnet);
  useEffect(() => {
    const fetchChain = async () => {
      try {
        const chainId = await provider.request({
          method: "eth_chainId",
        });

        if (chainId === "0x1") {
          setIsMainnet(true);
        }
      } catch (error) {
        console.error("Error fetching chainId:", error);
      }
    };

    if (isConnected) fetchChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    if (isMainnet) {
      provider
        .request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          console.log("accounts", accounts);
          // store it in state
          setAccount(accounts[0]);
          if (prevIsMainnet.current !== isMainnet)
            setStepper((prevState) => prevState + 1);
        })
        .catch((error: { message: string; code: number; data?: unknown }) =>
          console.log("error", error),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMainnet]);

  return (
    <BaseCard hasBack={() => setStepper((prevState) => prevState - 1)}>
      <Title title={"1. Connect your wallet"} />

      {provider ? (
        !isConnected ? (
          <>
            <p>To continue it's mandatory to connect your wallet</p>
            {providerReq.loading && (
              <LoadingView steps={["Connecting wallet"]} />
            )}
            {providerReq.error && (
              <div className="text-sm text-error-red">
                Error while trying to connect wallet. For more information check
                the console
                {
                  <div className="mt-3 overflow-scroll text-xs">
                    <ErrorView error={providerReq.error} />
                  </div>
                }
              </div>
            )}
            <ConnectWallet
              setIsConnected={setIsConnected}
              providerReq={providerReq}
              setProviderReq={setProviderReq}
              setAccount={setAccount}
              setIsMainnet={setIsMainnet}
            />
          </>
        ) : !isMainnet ? (
          <>
            <p>
              To continue it's mandatory to choose Mainnet as wallet's network
            </p>
            <SwitchNetwork setIsMainnet={setIsMainnet} />
          </>
        ) : !account ? (
          <p>Any accounts detected</p>
        ) : (
          <>
            <p>
              Your current ethereum address is:{" "}
              <span className="tracking-wider text-text-purple">{account}</span>
            </p>
            <Button onClick={() => setStepper((prevState) => prevState + 1)}>
              Next
            </Button>
          </>
        )
      ) : (
        <p>
          Non-Ethereum browser detected. Please, install MetaMask to continue
        </p>
      )}
    </BaseCard>
  );
}
