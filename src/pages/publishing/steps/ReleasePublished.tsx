import React from "react";
import { RepoAddresses, RequestStatus } from "types";
import BaseCard from "components/BaseCard";
import Button from "components/Button";
import Title from "components/Title";
import Link from "components/Link";

interface ReleasePublishedProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  publishReqStatus: RequestStatus<string>;
  repoAddresses: RepoAddresses | undefined;
}

export default function ReleasePublished({
  setStepper,
  publishReqStatus,
  repoAddresses,
}: ReleasePublishedProps) {
  return (
    <BaseCard>
      <Title title={"Release queued"} />
      <p>
        Your transaction has been queued successfully. It will be included in a
        block as soon as the gas fee you set becomes competitive, so it may take
        a while.
      </p>
      {publishReqStatus.result && (
        <p>
          Transaction hash:{" "}
          <Link
            href={`https://etherscan.io/tx/${publishReqStatus.result}`}
            className="break-all font-medium"
          >
            {publishReqStatus.result}
          </Link>
        </p>
      )}

      {repoAddresses?.registryAddress && (
        <p>
          You can also browse the published hash in the{" "}
          <Link
            href={`https://dappnode.github.io/explorer/#/repo/${repoAddresses.repoAddress?.toLowerCase()}`}
          >
            DAppNode Explorer
          </Link>
          .
        </p>
      )}

      <Button onClick={() => setStepper(0)}>Back to start</Button>
    </BaseCard>
  );
}
