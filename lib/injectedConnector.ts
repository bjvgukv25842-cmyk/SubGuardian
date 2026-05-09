"use client";

import { createConnector } from "@wagmi/core";
import { getAddress, numberToHex, UserRejectedRequestError, type Address } from "viem";
import { zeroGMainnet } from "@/lib/zeroG/chain";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export async function addZeroGMainnetToWallet(provider?: Eip1193Provider) {
  const targetProvider = provider || (typeof window !== "undefined" ? window.ethereum : undefined);
  if (!targetProvider) {
    throw new Error("No injected EVM wallet found. Install MetaMask, Rabby, OKX Wallet or another EVM wallet.");
  }

  await targetProvider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x4115",
        chainName: "0G Mainnet",
        nativeCurrency: {
          name: "0G",
          symbol: "0G",
          decimals: 18
        },
        rpcUrls: ["https://evmrpc.0g.ai"],
        blockExplorerUrls: ["https://chainscan.0g.ai"]
      }
    ]
  });
}

export function subguardianInjected() {
  return createConnector<Eip1193Provider | undefined>((config) => ({
    id: "subguardianInjected",
    name: "Injected Wallet",
    type: "injected",

    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error("No injected EVM wallet found. Install MetaMask, Rabby, OKX Wallet or another EVM wallet.");
      }

      const requested = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const accounts = requested.map((account) => getAddress(account));
      let currentChainId = await this.getChainId();

      if (chainId && currentChainId !== chainId) {
        await this.switchChain?.({ chainId });
        currentChainId = chainId;
      }

      provider.on?.("accountsChanged", this.onAccountsChanged);
      provider.on?.("chainChanged", this.onChainChanged);
      provider.on?.("disconnect", this.onDisconnect);
      config.emitter.emit("connect", { accounts, chainId: currentChainId });

      return { accounts, chainId: currentChainId };
    },

    async disconnect() {
      const provider = await this.getProvider();
      provider?.removeListener?.("accountsChanged", this.onAccountsChanged);
      provider?.removeListener?.("chainChanged", this.onChainChanged);
      provider?.removeListener?.("disconnect", this.onDisconnect);
      config.emitter.emit("disconnect");
    },

    async getAccounts() {
      const provider = await this.getProvider();
      if (!provider) {
        return [];
      }
      const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
      return accounts.map((account) => getAddress(account));
    },

    async getChainId() {
      const provider = await this.getProvider();
      if (!provider) {
        return 0;
      }
      const chainId = (await provider.request({ method: "eth_chainId" })) as string;
      return Number.parseInt(chainId, 16);
    },

    async getProvider() {
      if (typeof window === "undefined") {
        return undefined;
      }
      return window.ethereum;
    },

    async isAuthorized() {
      const accounts = await this.getAccounts();
      return accounts.length > 0;
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error("No injected EVM wallet found.");
      }

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: numberToHex(chainId) }]
        });
      } catch (error) {
        const maybeCode = (error as { code?: number; data?: { originalError?: { code?: number } } }).code;
        const nestedCode = (error as { data?: { originalError?: { code?: number } } }).data?.originalError?.code;
        if (maybeCode === 4902 || nestedCode === 4902) {
          await addZeroGMainnetToWallet(provider);
        } else {
          throw new UserRejectedRequestError(error as Error);
        }
      }

      config.emitter.emit("change", { chainId });
      return zeroGMainnet;
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit("disconnect");
        return;
      }
      config.emitter.emit("change", { accounts: accounts.map((account) => getAddress(account)) as Address[] });
    },

    onChainChanged(chainId) {
      config.emitter.emit("change", { chainId: Number.parseInt(chainId, 16) });
    },

    onDisconnect() {
      config.emitter.emit("disconnect");
    }
  }));
}
