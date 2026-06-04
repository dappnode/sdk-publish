import { ethers } from "ethers";

const CID_PATTERN = /^(Qm[a-zA-Z0-9]{44,}|bafy[a-zA-Z0-9]{44,})$/;

function isValidCid(cid: string): boolean {
  return CID_PATTERN.test(cid);
}

export async function checkPropagationWhitelist(
  propagationUrl: string,
  address: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      `${propagationUrl}/api/address/${ethers.getAddress(address)}`,
    );
    return res.status === 200;
  } catch (e) {
    console.warn("Propagation whitelist check failed", e);
    return false;
  }
}

export async function propagateRelease(
  propagationUrl: string,
  cid: string,
  signer: ethers.Signer,
  address: string,
): Promise<void> {
  if (!isValidCid(cid)) {
    throw new Error(`Invalid CID format: ${cid}`);
  }

  const body = JSON.stringify({ cid });
  const signature = await signer.signMessage(body);

  const res = await fetch(`${propagationUrl}/api/propagate-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Address": ethers.getAddress(address),
      "X-Signature": signature,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Propagation request failed (${res.status}): ${text}`,
    );
  }
}
