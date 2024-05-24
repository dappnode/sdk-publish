import React from "react";
import Button from "./Button";
import { ethers } from "ethers";
import { RequestStatus } from "types";

export default function ConnectWallet({
  setIsConnected,
  providerReq,
  setProviderReq,
  setIsMainnet,
  setAccount,
}: {
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  providerReq: RequestStatus<ethers.BrowserProvider>;
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

        //if wallet already connected
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
            }
          } catch (e) {
            setProviderReq({ error: e as Error, loading: false });
            console.error("Error fetching chainId:", e);
          }

          // ask for permissions if not connected already
        } else {
          try {
            setProviderReq({ loading: true });

            await window.ethereum.request({
              method: "wallet_requestPermissions",
              params: [{ eth_accounts: {} }],
            });
            setIsConnected(true);
            setProviderReq({
              result: new ethers.BrowserProvider(window.ethereum),
              loading: false,
            });
            console.log("Wallet connected");
          } catch (e) {
            console.error("Wallet must be connected: ", e);
            setProviderReq({ error: e as Error, loading: false });

            setIsConnected(false);
          }
        }
      } else {
        setIsConnected(false);
      }
    } catch (e) {
      console.error(e);
      setProviderReq({ error: e as Error, loading: false });
    }
  };

  return (
    <Button onClick={connectWallet} disabled={providerReq.loading}>
      Connect Wallet
    </Button>
  );
}
