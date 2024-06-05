import React from "react";
import BackBtn from "./BackBtn";

interface baseCardProps {
  hasBack?: () => void | undefined;
  children: React.ReactNode;
  className?: string;
}

export default function BaseCard({
  hasBack = undefined,
  children,
  className,
}: baseCardProps) {
  return (
    <div
      className={`relative mt-[6%] flex min-h-min w-4/5 flex-col md:w-4/5 lg:w-3/5 2xl:w-2/5 ${className}`}
    >
      {hasBack && <BackBtn onClick={() => hasBack()} />}
      <div className="flex flex-col gap-5 rounded-3xl bg-white p-9">
        {children}
      </div>
    </div>
  );
}
