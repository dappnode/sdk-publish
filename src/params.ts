// IPFS
export const IPFS_GATEWAY = "https://ipfs.io";

export const SDK_GUIDE_LINK =
  "https://github.com/dappnode/DAppNodeSDK/wiki/DAppNode-SDK-tutorial";
export const SDK_INSTALL_URL = "https://github.com/dappnode/DAppNodeSDK";

export const signatureFileName = "signature.json";
export const manifestFileName = "dappnode_package.json";

export const dappnodeKnownDpmRegistries: Record<string, string> = {
  // EIP-3770: Chain-specific addresses https://eips.ethereum.org/EIPS/eip-3770
  "dnp.dappnode.eth": "xdai:0x01c58A553F92A61Fd713e6006fa7D1d82044c389",
  "public.dappnode.eth": "xdai:0xE8addD62feD354203d079926a8e563BC1A7FE81e",
};
