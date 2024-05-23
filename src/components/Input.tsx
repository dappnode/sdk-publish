import React from "react";

interface inputProps {
  name: string;
  placeholder: string;
  value: string;
  success?: boolean;
  error?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  name,
  placeholder,
  value,
  onChange,
  error,
  success,
}: inputProps) {
  return (
    <div className="flex flex-col">
      <div className="text-text-purple">{name}</div>
      <input
        type="text"
        className={`w-full min-w-max rounded-2xl bg-background-color px-2 py-2 text-sm focus:outline-focused-purple ${
          error
            ? "text-error-red outline outline-1 outline-error-red focus:outline-error-red"
            : success &&
              "outline outline-1 outline-green-500 focus:outline-green-500"
        }`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
