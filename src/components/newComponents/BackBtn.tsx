import React from "react";
import { ReactComponent as LeftArrowSVG } from "img/left-arrow.svg";

export default function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute -top-10 left-0 flex h-10 max-w-min flex-row items-center gap-1 decoration-text-purple transition-all duration-300 ease-in-out hover:tracking-widest hover:underline"
      onClick={() => onClick()}
    >
      <LeftArrowSVG className="w-4" />
      <div className="mt-1 text-text-purple ">Back</div>
    </button>
  );
}
