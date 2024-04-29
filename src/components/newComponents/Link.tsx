import React from "react";

interface linkProps {
  href: string;
  children: React.ReactNode;
}

export default function Link({ href, children }: linkProps) {
  return (
    <a className="text-text-purple hover:text-text-purple" href={href}>
      {children}
    </a>
  );
}
