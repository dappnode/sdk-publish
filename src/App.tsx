import Header from "components/Header";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Publishing } from "pages/publishing/Publishing";
import { Ownership } from "pages/ownership/Ownership";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { RequestStatus } from "types";
import ConnectWalletStep from "components/ConnectWalletStep";

export function App() {
  // Wallet states
  const [isConnected, setIsConnected] = useState(false);
  const [isMainnet, setIsMainnet] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [providerReq, setProviderReq] = useState<
    RequestStatus<ethers.BrowserProvider>
  >({});

  // Precomputed variables
  const provider = providerReq.result;

  useEffect(() => {
    //Check if wallet already connected
    const getWallet = async () => {
      const addresses: string[] = await window.ethereum.request({
        method: "eth_accounts",
      });
      console.log(`addresses is ${addresses}`);
      if (addresses.length > 0) {
        setProviderReq({ loading: true });
        setIsConnected(true);
        setProviderReq({
          result: new ethers.BrowserProvider(window.ethereum),
          loading: false,
        });
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });

          setAccount(addresses[0]);
          if (chainId === "0x1") {
            setIsMainnet(true);
          }
        } catch (e) {
          setProviderReq({ error: e as Error, loading: false });
          console.error("Error fetching chainId:", e);
        }
      }
    };

    if (window.ethereum) {
      getWallet();
      window.ethereum.on("chainChanged", (chainId: string) => {
        console.log("event chainChanged: ", chainId);
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", (accounts: Array<string>) => {
        console.log("event accountsChanged");
        console.log("accounts", accounts);
        setAccount(accounts[0]);
      });

      window.ethereum.on(
        "message",
        (message: { type: string; data: unknown }) => {
          console.log("event message", message);
        },
      );
      window.ethereum.on(
        "disconnect",
        (error: { message: string; code: number; data?: unknown }) => {
          console.log("disconnect", error);
          setIsConnected(false);
        },
      );
    }
  }, []);

  return (
    <Router basename="/sdk-publish">
      <div className="flex h-screen w-screen flex-col overflow-y-scroll bg-background-color">
        <Header account={account} />
        {!isConnected || !isMainnet ? (
          <div className="flex flex-col items-center justify-center">
            <ConnectWalletStep
              account={account}
              setAccount={setAccount}
              isMainnet={isMainnet}
              setIsMainnet={setIsMainnet}
              isConnected={isConnected}
              setIsConnected={setIsConnected}
              provider={window.ethereum}
              providerReq={providerReq}
              setProviderReq={setProviderReq}
            />
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/sdk-publish" replace />}
            />
            <Route
              path="/sdk-publish"
              element={<Publishing account={account} provider={provider} />}
            />
            <Route path="/sdk-publish/ownership" element={<Ownership account={account} provider={provider} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
