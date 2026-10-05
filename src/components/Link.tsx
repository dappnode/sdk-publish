import React from "react";
import { newTabProps } from "utils/newTabProps";

interface linkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function Link({ href, children, className }: linkProps) {
  return (
    <a
      className={`font-modeG text-sm text-text-purple hover:text-text-purple ${
        className ?? ""
      }`}
      href={href}
      {...newTabProps}
    >
      {children}
    </a>
  );
}
