declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

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
  name: string;
  placeholder: string;
  value: any;
  onValueChange: (newValue: any) => void;
  validations?: FormFieldValidation[];
  warnings?: FormFieldValidation[];
}
export interface ReleaseDetails {
  name: string;
  value: string;
  validations?: FormFieldValidation[];
}
