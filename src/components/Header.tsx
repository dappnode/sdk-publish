import React from "react";
import dappnodeLogo from "img/dappnode-logo-only.png";

export default function Header({ account }: { account: string | null }) {
  return (
    <div className="flex h-[10%] w-full items-center justify-between px-10  ">
      <div className="flex items-center  gap-2">
        <img src={dappnodeLogo} alt="dappnode_logo" className="w-14" />
        <div className="flex flex-col text-xl">
          <span className="mt-2 font-bold tracking-widest text-text-purple">
            SDK
          </span>
          <span>publish</span>
        </div>
      </div>
      {account && (
        <p className="flex items-center justify-center rounded-xl bg-default-purple px-2 py-1  text-text-purple ">
          {account.substring(0, 5) +
            "..." +
            account.substring(account.length - 5)}
        </p>
      )}
    </div>
  );
}
