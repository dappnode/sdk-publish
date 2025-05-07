import React from "react";
import BaseCard from "components/BaseCard";
import Title from "components/Title";
import Button from "components/Button";

interface IntroductionStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
}

export default function IntroductionStep({
  setStepper,
}: IntroductionStepProps) {
  return (
    <BaseCard>
      <Title title={"Check ownership of a package"} />
      <p>
        This tool is part of the Dappnode Software Development Kit (dappnodesdk)
        and allows to check if an specified address is the owner or a developer
        addresses of a package.
      </p>
      <p>
        Also, allow package owners to transfer the ownership of a package to a
        new address or setting or revoking a developer address.
      </p>
      <Button onClick={() => setStepper((prevState) => prevState + 1)}>
        Start
      </Button>
    </BaseCard>
  );
}
