import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetworkCore,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";

export function useWallet() {
  // AppKit hook to get the address and check if the user is connected
  const { address, isConnected } = useAppKitAccount();
  // AppKit hook to get the chain id
  const { chainId } = useAppKitNetworkCore();
  // AppKit hook to get the wallet provider
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const getProvider = () => new BrowserProvider(walletProvider, chainId);

  return { address, isConnected, isMainnet: chainId === 1, getProvider };
}
