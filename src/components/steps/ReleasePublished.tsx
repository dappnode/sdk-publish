import React from "react";
import { RequestStatus } from "types";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Title from "../Title";

interface IntroductionStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  publishReqStatus: RequestStatus<string>;
}

export default function IntroductionStep({
  setStepper,
  publishReqStatus,
}: IntroductionStepProps) {
  return (
    <BaseCard>
      <Title title={"Release published"} />
      <p>Congratulations, your release has been successfully published!</p>
      {publishReqStatus.result && (
        <div>
          <span className="text-text-purple">Transaction hash: </span>
          {publishReqStatus.result}
        </div>
      )}

      <Button onClick={() => setStepper(0)}>Back to start</Button>
    </BaseCard>
  );
}
