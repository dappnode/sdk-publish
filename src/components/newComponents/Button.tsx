import React from "react";

interface buttonProps {
  children: React.ReactNode;
  onClick: void;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  disabled = false,
}: buttonProps) {
  return (
    <button
      className="text-text-purple bg-default-purple hover:bg-focused-purple disabled:bg-background-color flex w-full min-w-max items-center justify-center rounded-2xl px-3 py-3 transition-all duration-300 ease-in-out hover:tracking-widest hover:text-white disabled:tracking-normal disabled:text-gray-400"
      onClick={() => onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
