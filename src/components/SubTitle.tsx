import React from "react";

export const SubTitle: React.FunctionComponent<{ className?: string }> = ({
  children,
  className,
}) => <div className={`section-subtitle ${className || ""}`}>{children}</div>;
