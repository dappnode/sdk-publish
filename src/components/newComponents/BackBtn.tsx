import React from "react";
import { ReactComponent as LeftArrowSVG } from "img/left-arrow.svg";

export default function BackBtn({ onClick }: { onClick: void }) {
  return (
    <button
      className="flex h-10 flex-row items-center gap-1 transition-all duration-300 ease-in-out hover:tracking-widest hover:underline"
      onClick={() => onClick}
    >
      <LeftArrowSVG className="w-4" />
      <div className="text-text-purple mt-1 ">Back</div>
    </button>
  );
}
