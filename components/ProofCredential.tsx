"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { StatusPill } from "@/components/ui";
import { StoredDecision } from "@/lib/types";
import { decisionTone, formatMoney } from "@/lib/utils";
import { explorerAddressUrl, explorerTxUrl, subscriptionRegistryAddress } from "@/lib/zeroG/chain";

const proofCopy = {
  en: {
    back: "Back to console",
    eyebrow: "Audit proof",
    title: "SubGuardian Decision Credential",
    body: "A compact record of the pre-spend authorization returned to an AI agent before payment.",
    missing: "No decision was found for this ID. Run a spend authorization request, then open the returned proofUrl.",
    fields: {
      decisionId: "Decision ID",
      agent: "Agent",
      service: "Service",
      amount: "Amount",
      decision: "Decision",
      riskScore: "Risk score",
      analysisHash: "Analysis hash",
      storageRootHash: "Storage root hash",
      contractAddress: "0G Chain contract address",
      contractExplorer: "Contract Explorer link",
      chainTxHash: "0G Chain transaction hash",
      policyHash: "Policy hash",
      tee: "TEE verification",
      signer: "Signer wallet",
      explorerLink: "Explorer link",
      proofUrl: "Proof URL",
      mode: "Mode",
      reason: "Reason"
    }
  },
  zh: {
    back: "返回操作台",
    eyebrow: "审计凭证",
    title: "SubGuardian 决策凭证",
    body: "这是一份 AI Agent 付款前获得的花费授权记录，用于审计和追溯。",
    missing: "没有找到这个 ID 对应的决策。请先运行一次花费授权请求，再打开返回的 proofUrl。",
    fields: {
      decisionId: "Decision ID",
      agent: "Agent",
      service: "Service",
      amount: "Amount",
      decision: "Decision",
      riskScore: "Risk score",
      analysisHash: "Analysis hash",
      storageRootHash: "Storage root hash",
      contractAddress: "0G Chain contract address",
      contractExplorer: "Contract Explorer link",
      chainTxHash: "0G Chain transaction hash",
      policyHash: "Policy hash",
      tee: "TEE verification",
      signer: "Signer wallet",
      explorerLink: "Explorer link",
      proofUrl: "Proof URL",
      mode: "Mode",
      reason: "Reason"
    }
  }
} as const;

export function ProofCredential({ decision }: { decision: StoredDecision | null }) {
  const { language } = useLanguage();
  const text = proofCopy[language];
  const proofUrl = decision ? `/proof/${encodeURIComponent(decision.decisionId)}` : "";
  const explorerUrl = decision?.chainTxHash ? explorerTxUrl(decision.chainTxHash) : "";
  const contractExplorerUrl = explorerAddressUrl(subscriptionRegistryAddress);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="h-4 w-4" />
            {text.back}
          </Link>
          <LanguageToggle />
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{text.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">{text.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{text.body}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          {decision ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProofMetric label={text.fields.decisionId} value={decision.decisionId} mono />
                <ProofMetric label={text.fields.agent} value={decision.agentId} />
                <ProofMetric label={text.fields.service} value={decision.serviceName} />
                <ProofMetric label={text.fields.amount} value={formatMoney(decision.amount, decision.currency)} />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{text.fields.decision}</p>
                  <p className="mt-2">
                    <StatusPill tone={decisionTone(decision.decision) as "neutral" | "success" | "warning" | "danger"}>
                      {decision.decision}
                    </StatusPill>
                  </p>
                </div>
                <ProofMetric label={text.fields.riskScore} value={String(decision.riskScore)} />
                <ProofMetric label={text.fields.analysisHash} value={decision.analysisHash} mono />
                <ProofMetric label={text.fields.policyHash} value={decision.policyHash || "Not stored for this legacy proof."} mono />
                <ProofMetric label={text.fields.storageRootHash} value={decision.storageRootHash} mono />
                <ProofMetric label={text.fields.contractAddress} value={subscriptionRegistryAddress} mono />
                <ProofMetric
                  label={text.fields.chainTxHash}
                  value={decision.chainTxHash || "API proof only; chain write is completed from the dashboard wallet flow."}
                  mono
                />
                <ProofMetric label={text.fields.tee} value={decision.teeVerified ? `verified (${decision.computeTraceId || decision.traceId})` : `not verified / mock fallback (${decision.computeTraceId || decision.traceId})`} />
                <ProofMetric label={text.fields.signer} value={decision.userWallet || decision.walletAddress || "Unknown"} mono />
                <ProofMetric label={text.fields.mode} value={decision.mode || (decision.mockMode ? "mock" : "0g_live")} />
                <ProofMetric label={text.fields.proofUrl} value={proofUrl} mono />
              </div>

              {explorerUrl ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{text.fields.explorerLink}</p>
                  <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-1 break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    {explorerUrl}
                  </a>
                </div>
              ) : null}

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{text.fields.contractExplorer}</p>
                <a href={contractExplorerUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  {contractExplorerUrl}
                </a>
              </div>

              <ProofMetric label={text.fields.reason} value={decision.reason} />
            </div>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{text.missing}</div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProofMetric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 break-all text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
