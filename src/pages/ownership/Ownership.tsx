import { ethers } from "ethers";
import React, { useState } from "react";
import IntroductionStep from "./steps/IntroductionStep";
import PackageENSStep from "./steps/PackageENSStep";

interface OwnershipProps {
  account: string | null;
  provider: ethers.Provider | undefined;
}

export function Ownership({ account, provider }: OwnershipProps) {
  const [stepper, setStepper] = useState(0);

  function Steps() {
    switch (stepper) {
      // STEPS:
      // 0. Introduction
      // 1. Package ENS

      case 0:
        return <IntroductionStep setStepper={setStepper} />;
      case 1:
        return <PackageENSStep setStepper={setStepper} provider={provider!} />;
    }
  }

  return (
    <div className="flex h-full flex-col items-center pb-5">{Steps()}</div>
  );
}
