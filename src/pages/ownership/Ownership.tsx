import { ethers } from "ethers";
import React, { useState } from "react";
import IntroductionStep from "./steps/IntroductionStep";

interface OwnershipProps {
  account: string | null;
  provider: ethers.BrowserProvider | undefined;
}

export function Ownership({ account, provider }: OwnershipProps) {
  const [stepper, setStepper] = useState(0);

  function Steps() {
    switch (stepper) {
      // STEPS:
      // 0. Introduction

      case 0:
        return <IntroductionStep setStepper={setStepper} />;
    }
  }

  return (
    <div className="flex h-full flex-col items-center pb-5">{Steps()}</div>
  );
}
