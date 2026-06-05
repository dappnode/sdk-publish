import React, { useState, useRef, useEffect } from "react";
import dappnodeLogo from "img/dappnode-logo-only.png";
import { Link } from "react-router-dom";
import { useWallet } from "wallet/useWallet";
import { useAppKit } from "@reown/appkit/react";
import { readPropagationApiKey, writePropagationApiKey } from "settings";

export default function Header() {
  const { open } = useAppKit();
  const { isConnected } = useWallet();

  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [apiKey, setApiKey] = useState(readPropagationApiKey());
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowApiKeyPopup(false);
      }
    }
    if (showApiKeyPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showApiKeyPopup]);

  function saveApiKey() {
    writePropagationApiKey(apiKey);
    setShowApiKeyPopup(false);
  }

  return (
    <div className="flex h-[10%] w-full items-center justify-between bg-white px-10">
      <div className="flex items-center gap-2">
        <img src={dappnodeLogo} alt="dappnode_logo" className="w-14" />
        <div className="flex flex-col text-xl">
          <span className="mt-2 font-bold tracking-widest text-text-purple">
            SDK
          </span>
          <span>publish</span>
        </div>
      </div>

      <div className="ml-10 flex w-full flex-row justify-between">
        <nav className="flex justify-center gap-3 pt-2">
          <Link to="/" className="text-text-purple hover:text-purple-800">
            Publishing
          </Link>
          <Link
            to="/ownership"
            className="text-text-purple hover:text-purple-800"
          >
            Ownership
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="relative" ref={popupRef}>
            <button
              className="flex items-center justify-center rounded-2xl border border-text-purple/30 px-3 py-1.5 text-sm text-text-purple transition-all hover:bg-purple-50"
              onClick={() => setShowApiKeyPopup(!showApiKeyPopup)}
              title="Propagation API Key"
            >
              🔑 API Key
              {apiKey && (
                <span className="ml-1.5 h-2 w-2 rounded-full bg-success-green" />
              )}
            </button>
            {showApiKeyPopup && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <p className="mb-1 text-sm font-medium text-text-purple">
                  Propagation API Key
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Set your API key for automatic propagation. Persists across
                  sessions.
                </p>
                <input
                  className="w-full rounded-xl bg-background-color p-2 text-sm focus:outline-focused-purple"
                  type="password"
                  placeholder="Enter API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="rounded-lg px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
                    onClick={() => {
                      setApiKey("");
                      writePropagationApiKey("");
                      setShowApiKeyPopup(false);
                    }}
                  >
                    Clear
                  </button>
                  <button
                    className="rounded-lg bg-default-purple px-3 py-1 text-xs text-text-purple hover:bg-focused-purple hover:text-white"
                    onClick={saveApiKey}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          {isConnected ? (
            <appkit-account-button />
          ) : (
            <button
              className={`flex items-center justify-center rounded-2xl bg-default-purple px-2 pb-1.5 pt-2 text-sm text-text-purple transition-all duration-300 ease-in-out hover:bg-focused-purple hover:tracking-wide hover:text-white disabled:bg-background-color disabled:tracking-normal disabled:text-gray-400 `}
              onClick={() => open({ view: "Connect" })}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
