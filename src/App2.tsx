import Header from "components/newComponents/Header";
import IntroductionStep from "components/newComponents/steps/IntroductionStep";
import ReleaseFormStep from "components/newComponents/steps/ReleaseFormStep";
import React, { useState } from "react";

export function App() {
  const [stepper, setStepper] = useState(0);

  function Steps() {
    switch (stepper) {
      case 0:
        return (
          <IntroductionStep
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
          />
        );
      case 1:
        return (
          <ReleaseFormStep
            stepper={{
              state: stepper,
              setter: setStepper,
            }}
          />
        );
    }
  }
  return (
    <div className="flex h-screen w-screen flex-col ">
      <Header />
      <div className=" flex h-full flex-col items-center bg-background-color">
        {Steps()}
      </div>
    </div>
  );
}
