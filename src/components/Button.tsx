import React from "react";

interface buttonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  className,
}: buttonProps) {
  return (
    <button
      className={`flex w-full min-w-max items-center justify-center rounded-2xl bg-default-purple px-3 pb-2.5 pt-3 text-text-purple transition-all duration-300 ease-in-out hover:bg-focused-purple hover:tracking-widest hover:text-white disabled:bg-background-color disabled:tracking-normal disabled:text-gray-400 ${className}`}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
