import React from "react";
import dappnodeLogo from "img/dappnode-logo-only.png";

export default function Header() {
  return (
    <div className="flex  h-[10%] w-full items-center gap-2 pl-10">
      <img src={dappnodeLogo} alt="dappnode_logo" className="w-14" />
      <div className="flex flex-col text-xl">
        <span className="text-text-purple mt-2 font-bold tracking-widest">
          SDK
        </span>
        <span>publish</span>
      </div>
    </div>
  );
}
