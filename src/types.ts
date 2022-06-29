declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

export enum RegistryMode {
  APM = "APM",
  DPM = "DPM",
}

export enum NetworkId {
  Mainnet = "1",
  xDAI = "100",
}

export enum ChainId {
  Ethereum = "eth",
  xDAI = "xdai",
}

/**
 * EIP-3770: Chain-specific addresses https://eips.ethereum.org/EIPS/eip-3770
 * ```
 * xdai:0x01c58A553F92A61Fd713e6006fa7D1d82044c389
 * ```
 */
export type EIP3770AddressStr = string;

/**
 * EIP-3770: Chain-specific addresses https://eips.ethereum.org/EIPS/eip-3770
 * ```
 * xdai:0x01c58A553F92A61Fd713e6006fa7D1d82044c389
 * ```
 */
export type EIP3770Address = {
  /** `xdai` */
  chainId: string;
  /** `0x01c58A553F92A61Fd713e6006fa7D1d82044c389` */
  address: string;
};

export interface RequestStatus<R = unknown> {
  result?: R;
  loading?: boolean;
  error?: string | Error;
}

export interface Manifest {
  name: string;
  version: string;
}

export interface RepoAddresses {
  registryAddress: string | null;
  repoAddress: string | null;
}

export type ManifestWithHash = Manifest & { manifestHash: string };

export type FormFieldValidation = {
  isValid: boolean;
  message: string;
} | null;

export interface FormField {
  id: string;
  name: string;
  placeholder: string;
  help: string;
  value: any;
  onValueChange: (newValue: any) => void;
  validations?: FormFieldValidation[];
}
