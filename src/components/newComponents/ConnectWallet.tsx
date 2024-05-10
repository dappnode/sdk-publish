import React from "react";
import Button from "./Button";

export default function ConnectWallet({
  setIsConnected,
}: {
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // check is connected window.ethereum
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        setIsConnected(true);
        console.log("Wallet connected");
      } catch (error) {
        console.error("Wallet must be connected: ", error);

        setIsConnected(false);
      }
    } else {
      setIsConnected(false);
    }
  };

  return <Button onClick={connectWallet}>Connect Wallet</Button>;
}
