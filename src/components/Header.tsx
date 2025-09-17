import React from "react";
import dappnodeLogo from "img/dappnode-logo-only.png";
import { Link } from "react-router-dom";
import { useWallet } from "wallet/useWallet";
import { useAppKit } from "@reown/appkit/react";

export default function Header() {
  const { open } = useAppKit();
  const { isConnected } = useWallet();

  return (
    <div className="flex h-[10%] w-full items-center justify-between bg-white px-10">
      <div className="flex items-center gap-2">
        <img src={dappnodeLogo} alt="dappnode_logo" className="w-14" />
        <div className="flex flex-col text-xl">
          <span className="mt-2 font-bold tracking-widest text-text-purple">
            SDK
          </span>
          <span>publish</span>
        </div>
      </div>

      <div className="ml-10 flex w-full flex-row justify-between">
        <nav className="flex justify-center gap-3 pt-2">
          <Link to="/" className="text-text-purple hover:text-purple-800">
            Publishing
          </Link>
          <Link
            to="/ownership"
            className="text-text-purple hover:text-purple-800"
          >
            Ownership
          </Link>
        </nav>
        {isConnected ? (
          <appkit-account-button />
        ) : (
          <button
            className={`flex items-center justify-center rounded-2xl bg-default-purple px-2 pb-1.5 pt-2 text-sm text-text-purple transition-all duration-300 ease-in-out hover:bg-focused-purple hover:tracking-wide hover:text-white disabled:bg-background-color disabled:tracking-normal disabled:text-gray-400 `}
            onClick={() => open({ view: "Connect" })}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
