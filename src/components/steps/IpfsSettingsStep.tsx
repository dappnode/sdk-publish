import React, { useEffect } from "react";
import BaseCard from "../BaseCard";
import Title from "../Title";
import Button from "../Button";
import { writeIpfsApiUrls, writeIpfsGatewayUrls } from "settings";
import { DEFAULT_IPFS_GATEWAY, DEFAULT_IPFS_API } from "params";

interface IpfsSettingsStepProps {
  setStepper: React.Dispatch<React.SetStateAction<number>>;
  ipfsApiUrls: string;
  setIpfsApiUrls: React.Dispatch<React.SetStateAction<string>>;
  ipfsGatewayUrls: string;
  setIpfsGatewayUrls: React.Dispatch<React.SetStateAction<string>>;
}

export default function IpfsSettingsStep({
  setStepper,
  ipfsApiUrls,
  setIpfsApiUrls,
  ipfsGatewayUrls,
  setIpfsGatewayUrls,
}: IpfsSettingsStepProps) {
  useEffect(() => writeIpfsApiUrls(ipfsApiUrls), [ipfsApiUrls]);
  useEffect(() => writeIpfsGatewayUrls(ipfsGatewayUrls), [ipfsGatewayUrls]);
  return (
    <BaseCard hasBack={() => setStepper((prevState) => prevState - 1)}>
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
          placeholder="https://api.ipfs.dappnode.io/ &#13;&#10;http://your-own-ipfs-node:5001"
          value={ipfsApiUrls}
          onChange={(e) => setIpfsApiUrls(e.target.value)}
        />{" "}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-text-purple">IPFS Gateway URL</div>
        <p className="text-sm">
          Fulfill with a Gateway URLs to ensure that the IPFS hash has
          propagated or not.
        </p>
        <p></p>
        <input
          className={
            " rounded-2xl bg-background-color p-3  focus:outline-focused-purple "
          }
          placeholder={DEFAULT_IPFS_GATEWAY}
          value={ipfsGatewayUrls}
          onChange={(e) => setIpfsGatewayUrls(e.target.value)}
        />
      </div>
      <Button onClick={() => setStepper((prevState) => prevState + 1)}>
        Next
      </Button>
    </BaseCard>
  );
}
