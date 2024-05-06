import { ethers } from "ethers";
import React from "react";
import semver from "semver";
import { FormField } from "types";
import { isIpfsHash } from "utils/isIpfsHash";
import { isValidEns } from "utils/isValidEns";
import { notNullish } from "utils/notNullish";
import BaseCard from "../BaseCard";
import Button from "../Button";
import Input from "../Input";
import Title from "../Title";

interface ReleaseFormProps {
  stepper: {
    state: number;
    setter: React.Dispatch<React.SetStateAction<number>>;
  };
  dnpName: string;
  setDnpName: React.Dispatch<React.SetStateAction<string>>;
  developerAddress: string;
  setDeveloperAddress: React.Dispatch<React.SetStateAction<string>>;
  version: string;
  setVersion: React.Dispatch<React.SetStateAction<string>>;
  releaseHash: string;
  setReleaseHash: React.Dispatch<React.SetStateAction<string>>;
}

export default function ReleaseForm({
  stepper,
  dnpName,
  setDnpName,
  developerAddress,
  setDeveloperAddress,
  version,
  setVersion,
  releaseHash,
  setReleaseHash,
}: ReleaseFormProps) {
  // Form input variables

  const fields: FormField[] = [
    {
      name: "DAppNode Package name",
      placeholder: "i.e. yourpackage.public.dappnode.eth",
      value: dnpName,
      onValueChange: setDnpName,
      validations: [
        dnpName
          ? isValidEns(dnpName)
            ? { isValid: true, message: "Valid ENS domain" }
            : { isValid: false, message: "Invalid ENS domain" }
          : null,
      ],
    },
    {
      name: "Developer address",
      placeholder: "i.e. 0x0000000000000000000000000000000000000000",
      value: developerAddress,
      onValueChange: setDeveloperAddress,
      validations: [
        developerAddress
          ? ethers.isAddress(developerAddress)
            ? { isValid: true, message: "Valid address" }
            : { isValid: false, message: "Must be a valid ethereum address" }
          : null,
      ],
    },
    {
      name: "Next version",
      placeholder: "i.e. 0.1.7",
      value: version,
      onValueChange: setVersion,
      validations: [
        version
          ? semver.valid(version)
            ? { isValid: true, message: "Valid semver" }
            : { isValid: false, message: "Invalid semver" }
          : null,
      ],
    },
    {
      name: "Release hash",
      placeholder: "i.e. /ipfs/QmVeaz5kR55nAiGjYpXpUAJpWvf6net4MbGFNjBfMTS8xS",
      value: releaseHash,
      onValueChange: setReleaseHash,
      validations: [
        releaseHash
          ? isIpfsHash(releaseHash)
            ? { isValid: true, message: "Valid ipfs hash" }
            : { isValid: false, message: "Invalid ipfs hash" }
          : null,
      ],
    },
  ];

  const errors: string[] = fields
    .flatMap((field) => field.validations)
    .filter((validation) => validation !== null && !validation?.isValid)
    .map((validation) => validation?.message ?? "");

  return (
    <BaseCard
      hasBack={() => {
        stepper.setter(stepper.state - 1);
      }}
    >
      <Title title={"1. Release Details"} />
      <p>
        Fulfill the following form with the information of your package release.
      </p>
      {fields.map((field, i) => {
        const validations = (field.validations || []).filter(notNullish);
        const success = validations.filter((v) => v && v.isValid);
        const errors = validations.filter((v) => v && !v.isValid);
        return (
          <div key={i}>
            <Input
              key={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={field.value}
              error={errors.length > 0}
              success={success.length > 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.onValueChange(e.target.value)
              }
            ></Input>
            {field.validations &&
              field.validations.map((validation, i) =>
                validation ? (
                  <div
                    key={i}
                    className={`mt-2 text-xs ${
                      validation.isValid
                        ? "text-success-green"
                        : "text-error-red"
                    }`}
                  >
                    {validation.message}
                  </div>
                ) : null,
              )}
          </div>
        );
      })}
      <Button
        onClick={() => stepper.setter(stepper.state + 1)}
        disabled={
          errors.length > 0 ||
          dnpName === "" ||
          version === "" ||
          releaseHash === ""
        }
      >
        Next
      </Button>
    </BaseCard>
  );
}
