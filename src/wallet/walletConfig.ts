import { mainnet } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

export const projectId = process.env.REACT_APP_REOWN_PROJECT_ID || "";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const metadata = {
  name: "SDK Publish",
  description: "Dappnode UI Tool to publish packages",
  url: "https://dappnode.github.io/sdk-publish/",
  icons: [
    "https://gateway.ipfs.dappnode.io/ipfs/QmTVc5LQkTuaN3VxcteQ2E27pHSVJakE6XPo2FMxQTP284",
  ],
};

export const networks = [mainnet] as [AppKitNetwork, ...AppKitNetwork[]];

export const ethersAdapter = new EthersAdapter();
