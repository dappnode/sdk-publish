import React from "react";

interface inputProps {
  name: string;
  placeholder: string;
  value: string;
  onChange: void;
}

export default function Input({
  name,
  placeholder,
  value,
  onChange,
}: inputProps) {
  return (
    <div className="flex flex-col">
      <div className="text-text-purple">{name}</div>
      <input
        type="text"
        className="bg-background-color focus:outline-focused-purple w-full min-w-max rounded-2xl px-4 py-3  text-sm"
        placeholder={placeholder}
        value={value}
        onChange={() => onChange}
      />
    </div>
  );
}
