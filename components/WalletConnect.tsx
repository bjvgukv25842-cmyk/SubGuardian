"use client";

import { useState } from "react";
import { LogOut, PlugZap, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { zeroGChainId } from "@/lib/zeroG/chain";
import { formatAddress } from "@/lib/utils";
import { PrimaryButton, SecondaryButton, StatusPill } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";
import { addZeroGMainnetToWallet } from "@/lib/injectedConnector";

export function WalletConnect({ onConnected }: { onConnected?: (address: string) => void }) {
  const { t } = useLanguage();
  const [addNetworkError, setAddNetworkError] = useState("");
  const [addingNetwork, setAddingNetwork] = useState(false);
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, error, isPending } = useConnect({
    mutation: {
      onSuccess: (data) => {
        onConnected?.(data.accounts[0]);
      }
    }
  });
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const wrongChain = isConnected && chainId !== zeroGChainId;
  const injectedConnector = connectors[0];

  const addNetwork = async () => {
    setAddNetworkError("");
    setAddingNetwork(true);
    try {
      await addZeroGMainnetToWallet();
    } catch (error) {
      setAddNetworkError(error instanceof Error ? error.message : "Failed to add 0G Mainnet to MetaMask.");
    } finally {
      setAddingNetwork(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <StatusPill tone={wrongChain ? "warning" : "success"}>
          {wrongChain ? `${t.wallet.wrongChain}: ${chainId}` : `0G Mainnet ${zeroGChainId}`}
        </StatusPill>
        <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
          <Wallet className="h-4 w-4 text-emerald-700" />
          {formatAddress(address)}
        </div>
        {wrongChain ? (
          <SecondaryButton type="button" onClick={() => switchChain({ chainId: zeroGChainId })} disabled={isSwitching}>
            <PlugZap className="h-4 w-4" />
            {t.wallet.switchTo0G}
          </SecondaryButton>
        ) : null}
        <SecondaryButton type="button" onClick={addNetwork} disabled={addingNetwork}>
          <PlugZap className="h-4 w-4" />
          {addingNetwork ? "Adding..." : "Add 0G Mainnet to MetaMask"}
        </SecondaryButton>
        <SecondaryButton type="button" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4" />
          {t.wallet.disconnect}
        </SecondaryButton>
        {addNetworkError ? <p className="w-full text-right text-xs text-rose-600">{addNetworkError}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <SecondaryButton type="button" onClick={addNetwork} disabled={addingNetwork}>
        <PlugZap className="h-4 w-4" />
        {addingNetwork ? "Adding..." : "Add 0G Mainnet to MetaMask"}
      </SecondaryButton>
      <PrimaryButton
        type="button"
        onClick={() => injectedConnector && connect({ connector: injectedConnector, chainId: zeroGChainId })}
        disabled={!injectedConnector || isPending}
      >
        <Wallet className="h-4 w-4" />
        {isPending ? t.wallet.connecting : t.wallet.connectWallet}
      </PrimaryButton>
      {addNetworkError ? <p className="max-w-xs text-right text-xs text-rose-600">{addNetworkError}</p> : null}
      {error ? <p className="max-w-xs text-right text-xs text-rose-600">{error.message}</p> : null}
    </div>
  );
}
