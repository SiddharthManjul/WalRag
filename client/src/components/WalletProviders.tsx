"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { useState } from "react";

export function WalletProviders({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (needed by dapp-kit)
  const [queryClient] = useState(() => new QueryClient());

  // Configure Sui network
  const networks = {
    testnet: { url: getFullnodeUrl("testnet") },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
