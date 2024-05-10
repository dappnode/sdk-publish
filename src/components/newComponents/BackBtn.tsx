import React from "react";
import { ReactComponent as LeftArrowSVG } from "img/left-arrow.svg";

export default function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="group absolute -top-10 left-0 flex h-10 max-w-min flex-row items-center gap-1 decoration-text-purple transition-all duration-300 ease-in-out hover:tracking-widest "
      onClick={() => onClick()}
    >
      <LeftArrowSVG className="w-4" />
      <div className="mt-1 text-text-purple ">
        Back
        <span className="-mt-1 block h-0.5 max-w-0 rounded-lg bg-text-purple transition-all duration-300 group-hover:max-w-full"></span>
      </div>
    </button>
  );
}
