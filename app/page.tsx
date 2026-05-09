"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEventLogs } from "viem";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ChainPanel, ChainStatus } from "@/components/ChainPanel";
import { DemoLog } from "@/components/DemoLog";
import { Header } from "@/components/Header";
import { OverviewCards } from "@/components/OverviewCards";
import { PolicyPanel } from "@/components/PolicyPanel";
import { StoragePanel } from "@/components/StoragePanel";
import { SubscriptionTable } from "@/components/SubscriptionTable";
import { useLanguage } from "@/components/LanguageProvider";
import { analysisHashBytes32Browser } from "@/lib/browserHash";
import { defaultPolicy, mockSubscriptions } from "@/lib/mockData";
import { AnalysisResult, DemoLogItem, HealthResponse, RenewalPolicy, StorageUploadResult, SubscriptionItem } from "@/lib/types";
import { decisionToContractEnum, parseDateToUnix } from "@/lib/utils";
import { subscriptionPolicyRegistryAbi, subscriptionRegistryAddress } from "@/lib/zeroG/chain";

const initialDemoLog: DemoLogItem[] = [
  { id: "wallet", label: "Wallet connected", status: "pending" },
  { id: "subscription", label: "Subscription added", status: "pending" },
  { id: "storage", label: "Encrypted profile uploaded to 0G Storage", status: "pending" },
  { id: "compute", label: "AI analysis completed by 0G Compute", status: "pending" },
  { id: "chain", label: "Decision recorded on 0G Chain", status: "pending" }
];

export default function Home() {
  const { t } = useLanguage();
  const { address, chainId, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(mockSubscriptions);
  const [policy, setPolicy] = useState<RenewalPolicy>(defaultPolicy);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [storageResult, setStorageResult] = useState<StorageUploadResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [demoLog, setDemoLog] = useState<DemoLogItem[]>(initialDemoLog);
  const [chainStatus, setChainStatus] = useState<ChainStatus>({
    loadingAction: "",
    error: "",
    txHash: "",
    subId: "",
    analysisHash: ""
  });

  const storageRootHash = storageResult?.storageRootHash || "";
  const selectedRecommendation = analysis?.recommendations.find((item) => item.decision !== "renew") || analysis?.recommendations[0];
  const selectedDecision = selectedRecommendation?.decision || "";
  const primarySubscription = subscriptions.find((subscription) => subscription.serviceName === selectedRecommendation?.serviceName) || subscriptions[0];
  const walletReady = Boolean(isConnected && address);
  const wrongChain = walletReady && chainId !== Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID || 16661);

  const transactionHash = chainStatus.txHash as `0x${string}` | undefined;
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
    query: {
      enabled: Boolean(transactionHash)
    }
  });

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("subguardian-state");
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
      if (parsed.policy) setPolicy(parsed.policy);
      if (parsed.analysis) setAnalysis(parsed.analysis);
      if (parsed.storageResult) setStorageResult(parsed.storageResult);
    } catch {
      localStorage.removeItem("subguardian-state");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "subguardian-state",
      JSON.stringify({
        subscriptions,
        policy,
        analysis,
        storageResult
      })
    );
  }, [subscriptions, policy, analysis, storageResult]);

  useEffect(() => {
    if (analysis) {
      analysisHashBytes32Browser(analysis).then((hash) => {
        setChainStatus((current) => ({ ...current, analysisHash: hash }));
      });
    }
  }, [analysis]);

  useEffect(() => {
    if (!receipt || !transactionHash) {
      return;
    }

    if (!chainStatus.subId) {
      const logs = parseEventLogs({
        abi: subscriptionPolicyRegistryAbi,
        eventName: "SubscriptionAdded",
        logs: receipt.logs
      });
      const subId = logs[0]?.args?.subId?.toString();
      if (subId) {
        setChainStatus((current) => ({ ...current, subId }));
      }
    }
  }, [receipt, transactionHash, chainStatus.subId]);

  useEffect(() => {
    if (isConnected && address) {
      markLog("wallet", "success", address);
    }
  }, [isConnected, address]);

  const onAddSubscription = (subscription: SubscriptionItem) => {
    setSubscriptions((current) => [subscription, ...current]);
    markLog("subscription", "success", subscription.serviceName);
  };

  const analyze = async () => {
    setAnalysisLoading(true);
    setAnalysisError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions, policy, walletAddress: address })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t.errors.analyzeRequestFailed);
      }
      setAnalysis(payload);
      markLog("compute", "success", payload.traceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.analyzeRequestFailed;
      setAnalysisError(message);
      markLog("compute", "error", message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const upload = async () => {
    setStorageLoading(true);
    setStorageError("");
    try {
      const response = await fetch("/api/storage/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, subscriptions, policy, analysis })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t.errors.storageUploadRequestFailed);
      }
      setStorageResult(payload);
      markLog("storage", "success", payload.storageRootHash);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.storageUploadRequestFailed;
      setStorageError(message);
      markLog("storage", "error", message);
    } finally {
      setStorageLoading(false);
    }
  };

  const addSubscriptionOnChain = async () => {
    if (!walletReady) {
      setChainStatus((current) => ({
        ...current,
        error: "Please connect your wallet first using the Connect Wallet button at the top of the page."
      }));
      return;
    }
    if (wrongChain) {
      setChainStatus((current) => ({
        ...current,
        error: "Please switch your wallet to 0G Mainnet before sending this transaction."
      }));
      return;
    }
    if (!primarySubscription) {
      setChainStatus((current) => ({ ...current, error: t.errors.noSubscription }));
      return;
    }
    if (!subscriptionRegistryAddress) {
      setChainStatus((current) => ({ ...current, error: t.errors.missingContract }));
      return;
    }

    setChainStatus((current) => ({ ...current, loadingAction: "add", error: "" }));
    try {
      const hash = await writeContractAsync({
        address: subscriptionRegistryAddress as `0x${string}`,
        abi: subscriptionPolicyRegistryAbi,
        functionName: "addSubscription",
        args: [
          primarySubscription.serviceName,
          primarySubscription.category,
          BigInt(primarySubscription.amount),
          primarySubscription.currency,
          primarySubscription.billingCycle,
          parseDateToUnix(primarySubscription.nextRenewalDate),
          storageRootHash || "pending-storage-root"
        ]
      });
      setChainStatus((current) => ({ ...current, txHash: hash, loadingAction: "" }));
      markLog("chain", "success", hash);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.addSubscriptionTxFailed;
      setChainStatus((current) => ({ ...current, loadingAction: "", error: message }));
      markLog("chain", "error", message);
    }
  };

  const recordAnalysisOnChain = async () => {
    if (!walletReady) {
      setChainStatus((current) => ({
        ...current,
        error: "Please connect your wallet first using the Connect Wallet button at the top of the page."
      }));
      return;
    }
    if (wrongChain) {
      setChainStatus((current) => ({
        ...current,
        error: "Please switch your wallet to 0G Mainnet before sending this transaction."
      }));
      return;
    }
    if (!chainStatus.subId) {
      setChainStatus((current) => ({ ...current, error: t.errors.addSubscriptionFirst }));
      return;
    }
    if (!chainStatus.analysisHash) {
      setChainStatus((current) => ({ ...current, error: t.errors.runAnalysisFirst }));
      return;
    }

    setChainStatus((current) => ({ ...current, loadingAction: "analysis", error: "" }));
    try {
      const hash = await writeContractAsync({
        address: subscriptionRegistryAddress as `0x${string}`,
        abi: subscriptionPolicyRegistryAbi,
        functionName: "recordAnalysis",
        args: [BigInt(chainStatus.subId), chainStatus.analysisHash as `0x${string}`, storageRootHash || "pending-storage-root"]
      });
      setChainStatus((current) => ({ ...current, txHash: hash, loadingAction: "" }));
      markLog("chain", "success", hash);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.recordAnalysisTxFailed;
      setChainStatus((current) => ({ ...current, loadingAction: "", error: message }));
      markLog("chain", "error", message);
    }
  };

  const recordDecisionOnChain = async () => {
    if (!walletReady) {
      setChainStatus((current) => ({
        ...current,
        error: "Please connect your wallet first using the Connect Wallet button at the top of the page."
      }));
      return;
    }
    if (wrongChain) {
      setChainStatus((current) => ({
        ...current,
        error: "Please switch your wallet to 0G Mainnet before sending this transaction."
      }));
      return;
    }
    if (!chainStatus.subId) {
      setChainStatus((current) => ({ ...current, error: t.errors.addSubscriptionFirst }));
      return;
    }
    if (!selectedDecision) {
      setChainStatus((current) => ({ ...current, error: t.errors.runAnalysisBeforeDecision }));
      return;
    }

    setChainStatus((current) => ({ ...current, loadingAction: "decision", error: "" }));
    try {
      const hash = await writeContractAsync({
        address: subscriptionRegistryAddress as `0x${string}`,
        abi: subscriptionPolicyRegistryAbi,
        functionName: "recordDecision",
        args: [BigInt(chainStatus.subId), decisionToContractEnum(selectedDecision)]
      });
      setChainStatus((current) => ({ ...current, txHash: hash, loadingAction: "" }));
      markLog("chain", "success", hash);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.errors.recordDecisionTxFailed;
      setChainStatus((current) => ({ ...current, loadingAction: "", error: message }));
      markLog("chain", "error", message);
    }
  };

  const operationalNote = useMemo(() => {
    if (!subscriptionRegistryAddress) {
      return t.home.operationalNotes.noContract;
    }
    if (!storageRootHash) {
      return t.home.operationalNotes.noStorage;
    }
    return t.home.operationalNotes.ready;
  }, [storageRootHash, t]);

  function markLog(id: string, status: DemoLogItem["status"], detail?: string) {
    setDemoLog((current) =>
      current.map((item) => (item.id === id ? { ...item, status, detail, createdAt: new Date().toISOString() } : item))
    );
  }

  return (
    <main className="min-h-screen">
      <Header health={health} onConnected={(wallet) => markLog("wallet", "success", wallet)} />
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <span className="font-semibold">{t.home.alertTitle}</span> {t.home.alertBody} {operationalNote}
        </div>
        <OverviewCards subscriptions={subscriptions} policy={policy} analysis={analysis} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <SubscriptionTable subscriptions={subscriptions} analysis={analysis} onAdd={onAddSubscription} />
          <div className="flex flex-col gap-5">
            <PolicyPanel policy={policy} onChange={setPolicy} />
            <DemoLog items={demoLog} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <AnalysisPanel analysis={analysis} loading={analysisLoading} error={analysisError} onAnalyze={analyze} />
          <StoragePanel result={storageResult} loading={storageLoading} error={storageError} onUpload={upload} />
          <ChainPanel
            status={chainStatus}
            storageRootHash={storageRootHash}
            selectedDecision={selectedDecision}
            walletConnected={walletReady}
            wrongChain={Boolean(wrongChain)}
            onAddSubscription={addSubscriptionOnChain}
            onRecordAnalysis={recordAnalysisOnChain}
            onRecordDecision={recordDecisionOnChain}
          />
        </div>
      </div>
    </main>
  );
}
