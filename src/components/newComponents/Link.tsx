import React from "react";
import { newTabProps } from "utils/newTabProps";

interface linkProps {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, children }: linkProps) {
  return (
    <a
      className="font-modeG text-text-purple hover:text-text-purple"
      href={href}
      {...newTabProps}
    >
      {children}
    </a>
  );
}
