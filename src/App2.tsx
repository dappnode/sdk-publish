import { parseUrlQuery } from "utils/urlQuery";
import Header from "components/newComponents/Header";
import IntroductionStep from "components/newComponents/steps/IntroductionStep";
import ReleaseFormStep from "components/newComponents/steps/ReleaseFormStep";
import React, { useEffect, useState } from "react";

export function App() {
  const [stepper, setStepper] = useState(0);

  const [dnpName, setDnpName] = useState("");
  const [version, setVersion] = useState("");
  const [developerAddress, setDeveloperAddress] = useState("");
  const [releaseHash, setReleaseHash] = useState("");

  useEffect(() => {
    const urlParams = parseUrlQuery(window.location.search);
    console.log("URL params", urlParams);

    // Set state based on URL parameters
    if (urlParams.r) setDnpName(urlParams.r);
    if (urlParams.v) setVersion(urlParams.v);
    if (urlParams.d) setDeveloperAddress(urlParams.d);
    if (urlParams.h) setReleaseHash(urlParams.h);

    // Check if any URL parameter exists, then set the stepper
    if (urlParams.r || urlParams.v || urlParams.d || urlParams.h) {
      setStepper(1);
    }
  }, []);

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
            dnpName={dnpName}
            setDnpName={setDnpName}
            developerAddress={developerAddress}
            setDeveloperAddress={setDeveloperAddress}
            version={version}
            setVersion={setVersion}
            releaseHash={releaseHash}
            setReleaseHash={setReleaseHash}
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
