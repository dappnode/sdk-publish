import React from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";
import Link from "../Link";
import { SDK_INSTALL_URL } from "params";
import Button from "../Button";

interface IntroductionStepProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
}

export default function IntroductionStep({ stepper }: IntroductionStepProps) {
  return (
    <BaseCard>
      <Title title={"Publish your package"} />
      <p>
        This tool is part of the Dappnode Software Development Kit (dappnodesdk)
        and allows to sign Dappnode package release transactions with Metamask.
      </p>
      <p>
        To generate a pre-filled URL with the parameters to publish a release
        transaction install{" "}
        <Link href={SDK_INSTALL_URL}>@dappnode/dappnodesdk</Link>
      </p>
      <Button onClick={() => stepper.setter(stepper.state + 1)}>Start</Button>
    </BaseCard>
  );
}
