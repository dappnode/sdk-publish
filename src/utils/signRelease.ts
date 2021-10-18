import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import { base58btc } from "multiformats/bases/base58";
import { base32 } from "multiformats/bases/base32";
import { base64, base64url } from "multiformats/bases/base64";
import { ethers } from "ethers";
import sortBy from "lodash/sortBy";
import { signatureFileName } from "params";
import { parseIpfsPath } from "./isIpfsHash";
import { IPFSEntry } from "ipfs-core-types/src/root";
import path from "path";

export async function signRelease(releaseHash: string, ipfsApiUrls: string[]): Promise<string> {
  if (ipfsApiUrls.length < 1) {
    throw Error("ipfsApiUrls is empty");
  }

  const ipfsArr = ipfsApiUrls.map((ipfsApiUrl) => create({ url: ipfsApiUrl }));
  const [ipfs, ...ipfsExtras] = ipfsArr;

  // Format release hash, remove prefix
  releaseHash = parseIpfsPath(releaseHash);

  const releaseFiles = await dagGet(ipfs, releaseHash);
  if (releaseFiles.find((f) => f.name === signatureFileName)) {
    throw Error("Release is already signed");
  }

  const cidOpts: ReleaseSignature["cid"] = { version: 0, base: "base58btc" };
  const signedData = serializeIpfsDirectory(releaseFiles, cidOpts);

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // The Metamask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = provider.getSigner();

  const flatSig = await signer.signMessage(signedData);

  const signature: ReleaseSignature = {
    version: 1,
    cid: cidOpts,
    signature_protocol: "ECDSA_256",
    signature: flatSig,
  };

  const signatureJson = JSON.stringify(signature, null, 2);
  const signatureIpfsEntry = await ipfs.add(signatureJson);
  // Upload to redundant nodes if any
  for (const ipfsExtra of ipfsExtras) await ipfsExtra.add(signatureJson);

  const releaseRootDag: IpfsDagGetResult<IpfsDagPbValue> = await ipfs.dag.get(CID.parse(releaseHash));

  // Mutate dag-pb value appending a new Link
  // TODO: What happens if the block becomes too big
  releaseRootDag.value.Links.push({
    Hash: signatureIpfsEntry.cid,
    Name: signatureFileName,
    Tsize: signatureIpfsEntry.size,
  });

  // DAG-PB form (links must be sorted by Name then bytes)
  releaseRootDag.value.Links = sortBy(releaseRootDag.value.Links, ["Name", "Bytes"]);

  console.log(releaseRootDag);

  const dagProps = { format: "dag-pb", hashAlg: "sha2-256" };
  const newReleaseCid = await ipfs.dag.put(releaseRootDag.value, dagProps);
  // Upload to redundant nodes if any
  for (const ipfsExtra of ipfsExtras) await ipfsExtra.dag.put(releaseRootDag.value, dagProps);

  // Validate that the new release hash contains all previous files + signature
  const newReleaseFiles = await dagGet(ipfs, newReleaseCid.toString());
  const newFilesStr = JSON.stringify(newReleaseFiles.map((file) => file.name).sort());
  const expectedFilesStr = JSON.stringify([...releaseFiles.map((file) => file.name), signatureFileName].sort());
  if (newFilesStr !== expectedFilesStr) {
    throw Error(`Wrong files in new release: ${newFilesStr}`);
  }

  return newReleaseCid.toV0().toString();
}

interface IpfsDagPbValue {
  Data: Uint8Array;
  Links: {
    Hash: CID;
    /** "dappnode_package.json" */
    Name: string;
    /** 67 */
    Tsize: number;
  }[];
}

interface IpfsDagGetResult<V> {
  /**
   * The value or node that was fetched during the get operation
   */
  value: V;

  /**
   * The remainder of the Path that the node was unable to resolve or what was left in a localResolve scenario
   */
  remainderPath?: string;
}

/**
 * Example serializing `QmRhdmquYoiMR5GB2dKqhLipMzdFUeyZ2eSVvTLDvndTvh` with v0 base58btc
 *
 * ```
 * avatar.png zdj7WnZ4Yn4ev7T8qSACAjqnErfqfQsCPsfrHuJNKcaAp7PkJ
 * dappmanager.dnp.dappnode.eth_0.2.43_linux-amd64.txz zdj7WifbEQAjxvDftqcMBFPVexDu4SmMF66NkcoPJjtHv9HJQ
 * dappmanager.dnp.dappnode.eth_0.2.43_linux-arm64.txz zdj7WhMmCV4ZRJQ981bqsZd9Wcu6rSMqgSqx8fKJcnbmRhB5H
 * dappmanager.dnp.dappnode.eth_0.2.43.tar.xz zdj7WifbEQAjxvDftqcMBFPVexDu4SmMF66NkcoPJjtHv9HJQ
 * dappnode_package.json zdj7WbUmsj617EgJRysWqPpzJxriYfmBxBo1uhAv3kqq6k3VJ
 * docker-compose.yml zdj7Wf2pYesVyvSbcTEwWVd8TFtTjv588FET9L7qgkP47kRkf
 * ```
 */
function serializeIpfsDirectory(files: { name: string; cid: CID }[], opts: ReleaseSignature["cid"]): string {
  return (
    files
      .filter((file) => file.name !== signatureFileName)
      // Sort alphabetically in descending order
      .sort((a, b) => a.name.localeCompare(b.name))
      /** `${name} ${cidStr}` */
      .map((file) => {
        const cidStr = cidToString(getCidAtVersion(file.cid, opts.version), opts.base);
        return `${file.name} ${cidStr}`;
      })
      .join("\n")
  );
}

interface ReleaseSignature {
  /** Version of the ReleaseSignature format */
  version: 1;
  /** Specs of the signed CIDs */
  cid: {
    version: 0 | 1;
    base: "base58btc" | "base32" | "base64" | "base64url";
  };
  signature_protocol: "ECDSA_256";
  /**
   * Signature of the serialized files in the directory
   * ```
   * 0x71b61418808a85c495f52bc9c781cbfeb0154c86aec8528c6cf7a83a26a0365f7ac4dea4eea7eea5e4ec14a10e01d8b8708d8c0c7c12420d152a272b69092b851b
   * ```
   */
  signature: string;
}

function getCidAtVersion(cid: CID, version: number): CID {
  switch (version) {
    case 0:
      return cid.toV0();
    case 1:
      return cid.toV1();
    default:
      throw Error(`Unknown CID version ${version}`);
  }
}

function cidToString(cid: CID, base: string): string {
  switch (base) {
    case "base58btc":
      return cid.toString(base58btc);
    case "base32":
      return cid.toString(base32);
    case "base64":
      return cid.toString(base64);
    case "base64url":
      return cid.toString(base64url);
    default:
      throw Error(`Unknown CID base ${base}`);
  }
}

interface IpfsDagGet {
  Name: string;
  Size: number;
  Hash: string;
}

/**
 * REMOTE
 * List items in CID using Gateway endpoint /dag/get
 * IMPORTANT! ipfs.ls method not allowed in infura gateway, must be used dag-get
 * @param ipfs
 * @param hash
 */
export async function dagGet(ipfs: IPFSHTTPClient, hash: string): Promise<IPFSEntry[]> {
  const files: IPFSEntry[] = [];
  const hashSanitized = parseIpfsPath(hash);
  const cid = CID.parse(hashSanitized);
  const content = await ipfs.dag.get(cid);
  const contentLinks: IpfsDagGet[] = content.value.Links;
  if (!contentLinks) throw Error(`hash ${hashSanitized} does not contain links`);
  // eslint-disable-next-line array-callback-return
  contentLinks.map((link) => {
    if (!cid) throw Error("Error getting cid");
    files.push({
      type: "file",
      cid: CID.parse(parseIpfsPath(link.Hash.toString())),
      name: link.Name,
      path: path.join(link.Hash.toString(), link.Name),
      size: link.Size,
    });
  });
  return files;
}
