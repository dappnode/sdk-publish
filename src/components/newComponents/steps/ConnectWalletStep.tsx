import React, { useEffect, useRef } from "react";
import BaseCard from "../BaseCard";
import ConnectWallet from "../ConnectWallet";
import { SwitchNetwork } from "../SwitchNetwork";
import Title from "../Title";
import Button from "../Button";
import { RequestStatus } from "types";
import { ethers } from "ethers";

interface ConnectWalletStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  isMainnet: boolean;
  setIsMainnet: React.Dispatch<React.SetStateAction<boolean>>;
  provider: any;
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
  }, [isMainnet]);

  return (
    <BaseCard hasBack={() => setStepper((prevState) => prevState - 1)}>
      <Title title={"1. Connect your wallet"} />
      {provider ? (
        !isConnected ? (
          <>
            <p>To continue it's mandatory to connect your wallet</p>
            <ConnectWallet
              setIsConnected={setIsConnected}
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
              Your current metamask addres is:{" "}
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
