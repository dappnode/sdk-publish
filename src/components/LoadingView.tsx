import React, { useState, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

export function LoadingView({ steps }: { steps?: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => i + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {steps && (
        <div className="steps text-muted">
          {steps[index] || steps[steps.length - 1]}...
        </div>
      )}
      <ProgressBar animated now={100} />
    </div>
  );
}
