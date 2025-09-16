import Header from "components/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Publishing } from "pages/publishing/Publishing";
import { Ownership } from "pages/ownership/Ownership";
import React from "react";
import ConnectWalletStep from "components/ConnectWalletStep";
import { createAppKit } from "@reown/appkit/react";
import {
  ethersAdapter,
  metadata,
  networks,
  projectId,
} from "wallet/walletConfig";
import { useWallet } from "wallet/useWallet";

createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata,
  projectId,
  themeMode: "light",
  features: {
    analytics: true,
  },
});

export function App() {
  const { isConnected } = useWallet();

  return (
    <Router basename="/sdk-publish">
      <div className="flex h-screen w-screen flex-col overflow-y-scroll bg-background-color">
        <Header />
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center">
            <ConnectWalletStep />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Publishing />} />
            <Route path="/ownership" element={<Ownership />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
