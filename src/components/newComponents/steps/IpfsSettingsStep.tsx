import React from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";

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
  return (
    <BaseCard hasBack={() => stepper.setter(2)}>
      <Title title={"Edit IPFS settings"} />
      <p>
        You can edit your IPFS settings regarding the propagation of the
        releases. If not specified, the default values shown below will be
        applied.
      </p>
      <div className="text-text-purple">IPFS API URLs</div>
      <div className="flex flex-col">
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
      <div className="text-text-purple">IPFS Gateway URLs</div>
      <div className="flex flex-col">
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
    </BaseCard>
  );
}
