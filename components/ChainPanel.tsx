"use client";

import { ExternalLink, FileSignature, Hash, Loader2, ShieldCheck } from "lucide-react";
import { Panel, PanelHeader, PrimaryButton, SecondaryButton, StatusPill } from "@/components/ui";
import { explorerTxUrl, subscriptionRegistryAddress, zeroGExplorerUrl } from "@/lib/zeroG/chain";
import { useLanguage } from "@/components/LanguageProvider";

export interface ChainStatus {
  loadingAction: "" | "add" | "analysis" | "decision";
  error: string;
  txHash: string;
  subId: string;
  analysisHash: string;
}

export function ChainPanel({
  status,
  storageRootHash,
  selectedDecision,
  mode,
  proofUrl,
  walletConnected,
  wrongChain,
  onAddSubscription,
  onRecordAnalysis,
  onRecordDecision
}: {
  status: ChainStatus;
  storageRootHash: string;
  selectedDecision: string;
  mode?: "mock" | "external_llm" | "0g_live";
  proofUrl?: string;
  walletConnected: boolean;
  wrongChain: boolean;
  onAddSubscription: () => void;
  onRecordAnalysis: () => void;
  onRecordDecision: () => void;
}) {
  const { t } = useLanguage();
  const explorerUrl = status.txHash ? explorerTxUrl(status.txHash) : "";
  const missingContract = !subscriptionRegistryAddress;
  const chainWriteDisabled = Boolean(status.loadingAction) || !walletConnected || wrongChain || missingContract;
  const displayMode = mode || (missingContract ? "mock" : "0g_live");

  return (
    <Panel>
      <PanelHeader title={t.chain.title} eyebrow={t.chain.eyebrow} action={<ShieldCheck className="h-5 w-5 text-slate-500" />} />
      <div className="space-y-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.chain.contractAddress}</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-800">
            {subscriptionRegistryAddress ||
              "Contract address is not configured. Please deploy SubscriptionPolicyRegistry to 0G Mainnet and set NEXT_PUBLIC_CONTRACT_ADDRESS."}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.chain.latestStorageRoot}</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-800">{storageRootHash || t.chain.placeholders.storageRoot}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.chain.analysisHash}</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-800">{status.analysisHash || t.chain.placeholders.analysisHash}</p>
        </div>

        {!walletConnected ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Connect your wallet at the top of the page before recording anything on 0G Chain.
          </p>
        ) : null}
        {wrongChain ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Your wallet is connected to the wrong network. Switch to 0G Mainnet first.
          </p>
        ) : null}
        {missingContract ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Contract address is not configured. Please deploy SubscriptionPolicyRegistry to 0G Mainnet and set NEXT_PUBLIC_CONTRACT_ADDRESS.
          </p>
        ) : null}
        {status.error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{status.error}</p> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PrimaryButton type="button" onClick={onAddSubscription} disabled={chainWriteDisabled}>
            {status.loadingAction === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
            {t.chain.addSubscription}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onRecordAnalysis} disabled={chainWriteDisabled || !status.subId}>
            {status.loadingAction === "analysis" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
            {t.chain.recordAnalysis}
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onRecordDecision} disabled={chainWriteDisabled || !status.subId}>
            {status.loadingAction === "decision" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {t.chain.recordDecision}
          </SecondaryButton>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.chain.onChainSubscriptionId}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{status.subId || t.values.pending}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.chain.decisionToRecord}</p>
            <p className="mt-1">
              <StatusPill tone="neutral">{selectedDecision ? t.values.decision[selectedDecision as keyof typeof t.values.decision] || selectedDecision : t.values.pending}</StatusPill>
            </p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{displayMode}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proof URL</p>
            <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-900">
              {proofUrl || "Generated by /api/v1/spend/authorize before wallet chain write."}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.chain.latestTransactionHash}</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-800">{status.txHash || t.chain.placeholders.txHash}</p>
          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {t.chain.openExplorer} <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              {t.chain.explorerBase}: {zeroGExplorerUrl}
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}
