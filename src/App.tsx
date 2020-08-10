import React, { useState, useEffect, useMemo } from "react";
import web3Utils from "web3-utils";
import { ethers } from "ethers";
import memoizee from "memoizee";
import { debounce } from "lodash";
import semver from "semver";
// Components
import { Title } from "components/Title";
import { SubTitle } from "components/SubTitle";
import { Card } from "components/Card";
import { ErrorView } from "components/ErrorView";
import { LoadingView } from "components/LoadingView";
// Utils
import { parseUrlQuery } from "utils/urlQuery";
import { notNullish } from "utils/notNullish";
import { executePublishTx } from "utils/executePublishTx";
import { apmRepoIsAllowed } from "utils/apmRepoIsAllowed";
import { getLatestVersion } from "utils/getLatestVersion";
import { fetchManifest } from "utils/fetchManifest";
import { resolveDnpName } from "utils/resolveDnpName";
import { isValidBump } from "utils/isValidBump";
import { isIpfsHash } from "utils/isIpfsHash";
import { isValidEns } from "utils/isValidEns";
import { newTabProps } from "utils/newTabProps";
// Imgs
import metamaskIcon from "./img/metamask-white.png";
import { RequestStatus, RepoAddresses, Manifest, FormField } from "types";
import { IPFS_GATEWAY, SDK_INSTALL_URL } from "params";

const fetchManifestMem = memoizee(fetchManifest, { promise: true });
const resolveDnpNameMem = memoizee(resolveDnpName, { promise: true });
const getLatestVersionMem = memoizee(getLatestVersion, { promise: true });

/**
 * Convert to react-boostrap classes
 */
const getInputClass = ({
  success,
  error,
}: {
  success?: boolean;
  error?: boolean;
}) => (error ? "is-invalid" : success ? "is-valid" : "");

export function App() {
  // Form input variables
  const [dnpName, setDnpName] = useState("");
  const [version, setVersion] = useState("");
  const [developerAddress, setDeveloperAddress] = useState("");
  const [manifestHash, setManifestHash] = useState("");
  const [manifest, setManifest] = useState<Manifest & { hash: string }>();
  const [repoAddresses, setRepoAddresses] = useState<RepoAddresses>();
  const [latestVersion, setLatestVersion] = useState<string>();
  const [providerReq, setProviderReq] = useState<
    RequestStatus<ethers.providers.Web3Provider>
  >({});
  const [publishReqStatus, setPublishReqStatus] = useState<
    RequestStatus<string>
  >({});

  // Precomputed variables
  const provider = providerReq.result;

  /**
   * Grab the params from the URL and update local state
   * - Only once every mount, unmount
   */
  useEffect(() => {
    const urlParams = parseUrlQuery(window.location.search);
    console.log("URL params", urlParams);
    if (urlParams.r) setDnpName(urlParams.r);
    if (urlParams.v) setVersion(urlParams.v);
    if (urlParams.d) setDeveloperAddress(urlParams.d);
    if (urlParams.h) setManifestHash(urlParams.h);
  }, []);

  useEffect(() => {
    // Necessary code to refresh the userAddress
    // when user interacts with the metamask extension
    // @ts-ignore
    const ethereum = window.ethereum;
    if (ethereum)
      ethereum.on("accountsChanged", (accounts: string[]) => {
        console.log("new user account", accounts[0]);
      });
  }, []);

  // Check manifest for manifestHash

  const onNewManifestHash = useMemo(
    () =>
      debounce((hash: string) => {
        fetchManifestMem(hash, IPFS_GATEWAY)
          .then((manifest) => setManifest({ ...manifest, hash }))
          .catch((e) => console.error(`Error fetching manifest ${hash}`, e));
      }, 500),
    []
  );
  const onNewDnpName = useMemo(
    () =>
      debounce((dnpName: string, provider: ethers.providers.Provider) => {
        console.log("ON NEW DNP", dnpName);
        resolveDnpNameMem(dnpName, provider)
          .then(setRepoAddresses)
          .catch((e) => console.error(`Error resolving dnpName ${dnpName}`, e));
        getLatestVersionMem(dnpName, provider)
          .then(setLatestVersion)
          .catch((e) => console.error(`Error get latest ver ${dnpName}`, e));
      }, 500),
    []
  );

  useEffect(() => {
    if (manifestHash) onNewManifestHash(manifestHash);
  }, [manifestHash, onNewManifestHash]);

  useEffect(() => {
    if (dnpName && isValidEns(dnpName) && provider)
      onNewDnpName(dnpName, provider);
  }, [dnpName, provider, onNewDnpName]);

  async function connectToMetamask() {
    try {
      setProviderReq({ loading: true });
      // Modern dapp browsers...
      if (window.ethereum) {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        setProviderReq({
          result: new ethers.providers.Web3Provider(window.ethereum),
        });
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        setProviderReq({
          result: new ethers.providers.Web3Provider(
            window.web3.currentProvider
          ),
        });
      }
      // Non-dapp browsers...
      else {
        throw Error("Non-Ethereum browser detected. Please, install MetaMask");
      }
    } catch (e) {
      setProviderReq({ error: e });
    }
  }

  async function publish() {
    try {
      if (!dnpName) throw Error("Must provide a dnpName");
      if (!version) throw Error("Must provide a version");
      if (!manifestHash) throw Error("Must provide a manifestHash");

      setPublishReqStatus({ loading: true });

      if (!provider) throw Error(`Must connect to Metamask first`);
      const network = await provider.getNetwork();

      if (network && String(network.chainId) !== "1")
        throw Error("Transactions must be published on Ethereum Mainnet");

      const accounts = await provider.listAccounts();
      const userAddress = accounts[0];
      if (userAddress) {
        const { repoAddress } = await resolveDnpNameMem(dnpName, provider);
        if (repoAddress) {
          const isAllowed = await apmRepoIsAllowed(
            repoAddress,
            userAddress,
            provider
          );
          if (!isAllowed)
            throw Error(
              `Selected address ${userAddress} is not allowed to publish`
            );
        }
      }

      const txHash = await executePublishTx(
        { dnpName, version, manifestHash, developerAddress },
        provider
      );
      setPublishReqStatus({ result: txHash });
    } catch (e) {
      setPublishReqStatus({ error: e });
    }
  }

  /**
   * Description of the input fields
   */
  const fields: FormField[] = [
    {
      id: "dnpName",
      name: "DAppNode Package name",
      placeholder: "full ENS name",
      help:
        "ENS name of the DAppNode Package to update, i.e. timeapp.public.dappnode.eth",
      value: dnpName,
      onValueChange: setDnpName,
      validations: [
        dnpName
          ? isValidEns(dnpName)
            ? { isValid: true, message: "Valid ENS domain" }
            : { isValid: false, message: "Invalid ENS domain" }
          : null,
        dnpName && repoAddresses
          ? repoAddresses.registryAddress
            ? repoAddresses.repoAddress
              ? {
                  isValid: true,
                  message: `Repo already deployed at: ${repoAddresses.repoAddress}`,
                }
              : {
                  isValid: true,
                  message: `New repo to be deployed for ${dnpName}`,
                }
            : {
                isValid: false,
                message: `No valid registry found for ${dnpName}`,
              }
          : null,
      ],
    },
    {
      id: "developerAddress",
      name: "Developer address",
      placeholder: "Ethereum address",
      help: "Developer's Ethereum address that will control this repo",
      value: developerAddress,
      onValueChange: setDeveloperAddress,
      validations: [
        developerAddress
          ? web3Utils.isAddress(developerAddress)
            ? { isValid: true, message: "Valid address" }
            : { isValid: false, message: "Must be a valid ethereum address" }
          : null,
      ],
    },
    {
      id: "version",
      name: "Next version",
      placeholder: "Semantic version",
      help: "Semantic version about to be published, i.e. 0.1.7",
      value: version,
      onValueChange: setVersion,
      validations: [
        version
          ? semver.valid(version)
            ? { isValid: true, message: "Valid semver" }
            : { isValid: false, message: "Invalid semver" }
          : null,
        version && latestVersion
          ? isValidBump(latestVersion, version)
            ? { isValid: true, message: `Valid bump from ${latestVersion}` }
            : { isValid: false, message: "Next version is not a valid bump" }
          : null,
      ],
    },
    {
      id: "manifestIpfsHash",
      name: "Manifest hash",
      placeholder: "IPFS multihash",
      help:
        "IPFS hash of the manifest. Must be in the format /ipfs/[multihash], i.e. /ipfs/QmVeaz5kR55nAiGjYpXpUAJpWvf6net4MbGFNjBfMTS8xS",
      value: manifestHash,
      onValueChange: setManifestHash,
      validations: [
        manifestHash
          ? isIpfsHash(manifestHash)
            ? { isValid: true, message: "Valid ipfs hash" }
            : { isValid: false, message: "Invalid ipfs hash" }
          : null,
        manifest &&
        manifestHash &&
        manifestHash === manifest.hash &&
        manifest.name &&
        manifest.version
          ? manifest.name === dnpName && manifest.version === version
            ? { isValid: true, message: "Manifest successfully verified" }
            : {
                isValid: false,
                message: `Manifest verification failed. This manifest is for ${manifest.name} @ ${manifest.version}`,
              }
          : null,
      ],
    },
  ];

  return (
    <div className="app">
      <Title title="SDK" subtitle="Publish" />
      <div className="mt-3 text-muted">
        <p>
          This tool is part of the DAppNode Software Development Kit
          (dappnodesdk) and allows to sign DAppNode package release transactions
          with Metamask.
        </p>
        {!window.location.search && (
          <div
            className="alert alert-secondary"
            role="alert"
            style={{ backgroundColor: "#f1f1f3" }}
          >
            To generate a pre-filled URL with the parameters to publish a
            release transaction install{" "}
            <a href={SDK_INSTALL_URL} {...newTabProps}>
              <code>@dappnode/dappnodesdk</code>
            </a>
          </div>
        )}
      </div>
      <SubTitle>Transaction details</SubTitle>
      <Card>
        <div className="publish-grid">
          {fields.map((field) => {
            const validations = (field.validations || []).filter(notNullish);
            const success = validations.filter((v) => v && v.isValid);
            const errors = validations.filter((v) => v && !v.isValid);
            return (
              <React.Fragment key={field.name}>
                <div className="field-name">{field.name}</div>
                <div>
                  <input
                    className={`form-control ${getInputClass({
                      error: errors.length > 0,
                      success: success.length > 0,
                    })}`}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onValueChange(e.target.value)}
                  />
                  {success.map((item, i) => (
                    <div className="valid-feedback">
                      <div key={i}>{item.message}</div>
                    </div>
                  ))}
                  {errors.map((item, i) => (
                    <div className="invalid-feedback">
                      <div key={i}>{item.message}</div>
                    </div>
                  ))}
                  <small className="form-text text-muted help">
                    {field.help}
                  </small>
                </div>
              </React.Fragment>
            );
          })}

          {/* Empty left cell */}
          <div />
          <div className="bottom-section">
            {/* Publish button */}
            {provider ? (
              <button
                className="btn btn-dappnode"
                disabled={publishReqStatus.loading}
                onClick={publish}
              >
                Publish
              </button>
            ) : (
              <button
                className="btn btn-dappnode"
                disabled={providerReq.loading}
                onClick={connectToMetamask}
              >
                <img src={metamaskIcon} alt="" className="metamaskIcon" />{" "}
                Connect to Metamask
              </button>
            )}

            {providerReq.error && <ErrorView error={providerReq.error} />}
            {providerReq.loading && (
              <LoadingView steps={["Connecting to Metamask"]} />
            )}
            {publishReqStatus.error && (
              <ErrorView error={publishReqStatus.error} />
            )}
            {publishReqStatus.loading && (
              <LoadingView steps={["Publishing release transaction"]} />
            )}
            {publishReqStatus.result && (
              <div className="feedback-success">
                Published transaction! Tx hash: {publishReqStatus.result}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
