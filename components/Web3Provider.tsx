"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { zeroGMainnet, zeroGRpcUrl } from "@/lib/zeroG/chain";
import { subguardianInjected } from "@/lib/injectedConnector";
import { useState } from "react";

const config = createConfig({
  chains: [zeroGMainnet],
  connectors: [subguardianInjected()],
  transports: {
    [zeroGMainnet.id]: http(zeroGRpcUrl)
  },
  ssr: true
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
