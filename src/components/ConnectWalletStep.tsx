import React from "react";
import BaseCard from "./BaseCard";
import Button from "./Button";
import Title from "./Title";
import { useAppKit } from "@reown/appkit/react";

export default function ConnectWalletStep() {
  const { open } = useAppKit();

  return (
    <BaseCard>
      <Title title={"Connect your wallet"} />

      <Button onClick={() => open({ view: "Connect" })}>Connect Wallet</Button>
    </BaseCard>
  );
}
