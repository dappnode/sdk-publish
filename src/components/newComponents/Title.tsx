import React from "react";

export default function Title({ title }: { title: string }) {
  return <div className="text-lg font-bold tracking-wider">{title}</div>;
}
