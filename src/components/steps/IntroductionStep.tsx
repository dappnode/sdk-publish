import React from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";
import Link from "../Link";
import { SDK_INSTALL_URL } from "params";
import Button from "../Button";

interface IntroductionStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
}

export default function IntroductionStep({
  setStepper,
}: IntroductionStepProps) {
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
      <Button onClick={() => setStepper((prevState) => prevState + 1)}>
        Start
      </Button>
    </BaseCard>
  );
}
