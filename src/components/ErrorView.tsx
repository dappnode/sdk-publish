import React from "react";
import "./errorView.css";

function parseError(error: Error | string) {
  if (error instanceof Error)
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
        <pre>{detail}</pre>
      </details>
    </div>
  );
}
