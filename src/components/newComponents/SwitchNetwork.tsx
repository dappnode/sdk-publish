import React from "react";
import Button from "./Button";
declare global {
  interface Window {
    provider: any;
  }
}

export function SwitchNetwork({
  setIsMainnet,
}: {
  setIsMainnet: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x1` }],
      });
      setIsMainnet(true);
    } catch (switchError) {
      console.error("Error adding network to wallet provider:", switchError);
      setIsMainnet(false);
    }
  };

  return <Button onClick={switchNetwork}>Switch network</Button>;
}
