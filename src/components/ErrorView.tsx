import React from "react";

function parseError(
  error: Error | { message: string; stack: string } | string,
) {
  if (error instanceof Error || (typeof error === "object" && error.message))
    return { message: error.message, detail: error.stack };
  if (typeof error === "string") return { message: error };
  return { message: JSON.stringify(error), detail: "" };
}

export function ErrorView({ error }: { error: Error | string }) {
  const { message, detail } = parseError(error);

  return (
    <div className="errorView">
      <details>
        <summary>{message.split("\n")[0]}</summary>
        <pre className="whitespace-pre-wrap break-all">{detail}</pre>
      </details>
    </div>
  );
}
