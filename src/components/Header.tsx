import React from "react";
import dappnodeLogo from "img/dappnode-logo-only.png";
import { Link } from "react-router-dom";

export default function Header({ account }: { account: string | null }) {
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

      <div className="flex flex-row justify-between w-full ml-10">
        <nav className="flex justify-center pt-2 gap-5">
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
        {account && (
          <div className="flex flex-col justify-center">

          <p className="flex items-center justify-center rounded-xl bg-default-purple px-2 py-1  text-text-purple ">
            {account.substring(0, 5) +
              "..." +
              account.substring(account.length - 5)}
          </p>
              </div>
        )}{" "}
      </div>
    </div>
  );
}
