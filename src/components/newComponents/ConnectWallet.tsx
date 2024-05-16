import React from "react";
import Button from "./Button";
import { ethers } from "ethers";
import { RequestStatus } from "types";

export default function ConnectWallet({
  setIsConnected,
  setProviderReq,
  setIsMainnet,
  setAccount,
}: {
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setProviderReq: (
    value: React.SetStateAction<RequestStatus<ethers.BrowserProvider>>,
  ) => void;

  setIsMainnet: React.Dispatch<React.SetStateAction<boolean>>;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const addresses: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (addresses.length > 0) {
          setIsConnected(true);
          try {
            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            });

            if (chainId === "0x1") {
              setIsMainnet(true);
            }
          } catch (error) {
            console.error("Error fetching chainId:", error);
          }
          setAccount(addresses[0]);
        } else {
          try {
            setProviderReq({ loading: true });
            // check is connected window.ethereum
            await window.ethereum.request({
              method: "wallet_requestPermissions",
              params: [{ eth_accounts: {} }],
            });
            setIsConnected(true);
            setProviderReq({
              result: new ethers.BrowserProvider(window.ethereum),
            });
            console.log("Wallet connected");
          } catch (error) {
            console.error("Wallet must be connected: ", error);

            setIsConnected(false);
          }
        }
      } else {
        setIsConnected(false);
      }
    } catch (e) {
      console.error(e);
      setProviderReq({ error: e as Error });
    }
  };

  return <Button onClick={connectWallet}>Connect Wallet</Button>;
}
