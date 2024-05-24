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
    <div className="relative mt-[6%] flex  w-4/5 min-w-min flex-col  md:w-4/5 lg:w-3/5 2xl:w-2/5">
      {hasBack && <BackBtn onClick={() => hasBack()} />}
      <div className="flex min-h-min flex-col gap-5 overflow-x-auto rounded-3xl bg-white p-9">
        {children}
      </div>
    </div>
  );
}
