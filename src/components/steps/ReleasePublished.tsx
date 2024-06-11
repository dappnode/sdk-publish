import React from "react";
import { RepoAddresses, RequestStatus } from "types";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Title from "../Title";
import Link from "components/Link";

interface IntroductionStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  publishReqStatus: RequestStatus<string>;
  repoAddresses: RepoAddresses | undefined;
}

export default function IntroductionStep({
  setStepper,
  publishReqStatus,
  repoAddresses,
}: IntroductionStepProps) {
  return (
    <BaseCard>
      <Title title={"Release queued"} />
      <p>
        Your transaction has been successfully queued! It will be processed
        sooner or later based on the gas fee you provided.
      </p>
      {publishReqStatus.result && (
        <div>
          <span className="text-text-purple">Transaction hash: </span>
          <span className="font-poppins font-medium">
            {publishReqStatus.result}
          </span>
        </div>
      )}
      <p>
        To check the transaction status and details navigate{" "}
        <Link href={`https://etherscan.io/tx/${publishReqStatus.result}`}>
          here.
        </Link>
      </p>

      {repoAddresses?.registryAddress && (
        <p>
          {" "}
          To check the hash content in dappnode explorer navigate{" "}
          <Link
            href={`https://dappnode.github.io/explorer/#/repo/${repoAddresses.repoAddress?.toLocaleLowerCase()}`}
          >
            here
          </Link>
        </p>
      )}

      <Button onClick={() => setStepper(0)}>Back to start</Button>
    </BaseCard>
  );
}
