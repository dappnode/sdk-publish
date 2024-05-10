import React, { useEffect } from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";
import Button from "../Button";
import { writeIpfsApiUrls } from "settings";

interface IpfsSettingsStepProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
  ipfsApiUrls: string;
  setIpfsApiUrls: React.Dispatch<React.SetStateAction<string>>;
}

export default function IpfsSettingsStep({
  stepper,
  ipfsApiUrls,
  setIpfsApiUrls,
}: IpfsSettingsStepProps) {
  useEffect(() => writeIpfsApiUrls(ipfsApiUrls), [ipfsApiUrls]);
  return (
    <BaseCard hasBack={() => stepper.setter(stepper.state - 1)}>
      <Title title={"2. Edit IPFS settings"} />
      <p>
        You can edit your IPFS settings regarding the propagation of the
        releases. If not specified, the default values shown below will be
        applied.
      </p>
      <div className="flex flex-col gap-1">
        <div className="text-text-purple">IPFS API URLs</div>
        <p className="text-sm">
          Fulfill with multiple API URLs, to facilitate propagation of the
          signed release
        </p>
        <textarea
          className={
            " rounded-2xl bg-background-color p-3  focus:outline-focused-purple "
          }
          placeholder="https://infura-ipfs.io:5001 &#13;&#10;http://your-own-ipfs-node:5001"
          value={ipfsApiUrls}
          onChange={(e) => setIpfsApiUrls(e.target.value)}
        />{" "}
      </div>
      {/* // TODO: IPFS gateway logic */}
      <div className="flex flex-col gap-1">
        <div className="text-text-purple">IPFS Gateway URLs</div>
        <p className="text-sm">
          Fulfill with multiple Gateway URLs to ensure that the IPFS hash has
          propagated or not.
        </p>
        <p></p>
        <textarea
          className={
            " rounded-2xl bg-background-color p-3  focus:outline-focused-purple "
          }
          placeholder="https://gateway-dev.ipfs.dappnode.io"
          // value={ipfsApiUrls}
          // onChange={(e) => setIpfsApiUrls(e.target.value)}
        />
      </div>
      <Button onClick={() => stepper.setter(stepper.state + 1)}>Next</Button>
    </BaseCard>
  );
}
