import React from "react";
import BackBtn from "./BackBtn";

interface baseCardProps {
  hasBack?: () => void | undefined;
  children: React.ReactNode;
}

export default function BaseCard({
  hasBack = undefined,
  children,
}: baseCardProps) {
  return (
    <div className="relative mt-[6%] flex min-h-min w-4/5 flex-col lg:w-2/5">
      {hasBack && <BackBtn onClick={() => hasBack()} />}
      <div className="flex flex-col gap-5 rounded-3xl bg-white p-9">
        {children}
      </div>
    </div>
  );
}
