import React from "react";
import dappnodeLogo from "img/dappnode-logo-only.png";
import { Link } from "react-router-dom";

export default function Header() {
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
        <appkit-button />
      </div>
    </div>
  );
}
