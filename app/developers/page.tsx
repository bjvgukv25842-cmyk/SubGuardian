"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { FieldLabel, PrimaryButton, StatusPill, TextArea, TextInput } from "@/components/ui";
import { AgentAuthorizationDecision, BillingCycle, BudgetStatus, SubscriptionCategory, UsageSignal } from "@/lib/types";
import { decisionTone } from "@/lib/utils";
import { explorerAddressUrl, explorerTxUrl, subscriptionRegistryAddress } from "@/lib/zeroG/chain";

interface SpendForm {
  agentId: string;
  userWallet: string;
  serviceName: string;
  amount: number;
  reason: string;
  category: SubscriptionCategory;
  currency: string;
  billingCycle: BillingCycle;
}

interface SpendAuthorizationResponse {
  decisionId: string;
  decision: AgentAuthorizationDecision;
  riskScore: number;
  requiresUserApproval: boolean;
  usageSignal: UsageSignal;
  usageSignalSource: string;
  budgetStatus: BudgetStatus;
  reason: string;
  analysisHash: string;
  storageRootHash: string;
  chainTxHash: string | null;
  mode: "mock" | "external_llm" | "0g_live";
  proofUrl: string;
}

const defaultForm: SpendForm = {
  agentId: "research-agent",
  userWallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  serviceName: "OpenAI API",
  amount: 18,
  reason: "Run retrieval and summarization for a customer research task.",
  category: "API",
  currency: "USDT",
  billingCycle: "monthly"
};

const defaultPolicy = {
  monthlyBudget: 100,
  manualApprovalAbove: 25,
  defaultAction: "ask_user",
  trustedServices: ["OpenAI API", "ChatGPT Plus", "Cursor", "0G Compute"],
  blockedServices: ["Random AI API"],
  autoApproveBelow: 10,
  requireApprovalForUnknownService: true,
  maxSingleSpend: 80,
  renewalCooldownDays: 7
} as const;

const fetchExample = `const res = await fetch("/api/v1/spend/authorize", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer sg_demo_local",
    "X-SubGuardian-Demo": "developers-page"
  },
  body: JSON.stringify({
    agentId: "research-agent",
    userWallet: "0x...",
    serviceName: "OpenAI API",
    amount: 18,
    reason: "Run customer research task"
  })
});

const decision = await res.json();`;

const copy = {
  en: {
    title: "Developer Demo / API Simulator",
    subtitle:
      "AI Agent spends only after SubGuardian checks budget, usage, and policy, then returns allow / pause / reject / ask_user with auditable proof.",
    requestEyebrow: "Simulated Agent Spend Request",
    requestTitle: "Ask before spending",
    advanced: "Advanced defaults",
    submit: "Authorize spend",
    loading: "Checking request",
    ready: "Default values are ready to test.",
    resultEyebrow: "Authorization result",
    resultTitle: "Decision returned by API",
    emptyResult: "Submit the request to see the API return a decision, risk score, approval flag, usage signal, reason, and proof URL.",
    howItWorks: "How it works",
    steps: [
      "Agent asks before spending",
      "SubGuardian checks policy + budget + usage",
      "API returns allow / pause / reject / ask_user with proof"
    ],
    apiEyebrow: "API Integration",
    apiTitle: "Minimum fetch example",
    requestFailed: "Authorization failed."
  },
  zh: {
    title: "开发者 Demo / API 模拟器",
    subtitle: "AI Agent 花钱前先问 SubGuardian；SubGuardian 根据预算、用量和策略返回 allow / pause / reject / ask_user，并生成可审计 proof。",
    requestEyebrow: "模拟 Agent 花费请求",
    requestTitle: "花钱前先请求授权",
    advanced: "高级默认值",
    submit: "授权这笔支出",
    loading: "正在检查请求",
    ready: "默认值可直接点击测试。",
    resultEyebrow: "授权结果",
    resultTitle: "API 返回的决策",
    emptyResult: "提交这条请求，查看 API 返回的 decision、riskScore、requiresApproval、usageSignal、reason 和 proofUrl。",
    howItWorks: "工作方式",
    steps: ["Agent 花钱前先询问", "SubGuardian 检查策略、预算和用量", "API 返回 allow / pause / reject / ask_user，并附带 proof"],
    apiEyebrow: "API 接入",
    apiTitle: "最小 fetch 示例",
    requestFailed: "授权请求失败。"
  }
} as const;

export default function DevelopersPage() {
  const { language } = useLanguage();
  const text = copy[language];
  const [form, setForm] = useState<SpendForm>(defaultForm);
  const [result, setResult] = useState<SpendAuthorizationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const proofUrl = result?.proofUrl || (result?.decisionId ? `/proof/${encodeURIComponent(result.decisionId)}` : "");
  const explorerUrl = result?.chainTxHash ? explorerTxUrl(result.chainTxHash) : "";
  const contractExplorerUrl = explorerAddressUrl(subscriptionRegistryAddress);
  const displayDecision = result?.decision;
  const idempotencyKey = useMemo(
    () => `console-${form.agentId}-${form.userWallet}-${form.serviceName}-${form.amount}`,
    [form.agentId, form.userWallet, form.serviceName, form.amount]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/spend/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer sg_demo_local",
          "X-SubGuardian-Demo": "developers-page"
        },
        body: JSON.stringify({
          ...form,
          requestedAt: new Date().toISOString(),
          idempotencyKey,
          policy: defaultPolicy
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || text.requestFailed);
      }
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">SubGuardian</p>
              <h1 className="text-2xl font-bold tracking-normal text-slate-950">{text.title}</h1>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <LanguageToggle />
            <p className="max-w-2xl text-sm leading-6 text-slate-600 lg:text-right">{text.subtitle}</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{text.requestEyebrow}</p>
                <h2 className="text-lg font-semibold text-slate-950">{text.requestTitle}</h2>
              </div>
              <StatusPill tone="neutral">POST /api/v1/spend/authorize</StatusPill>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>agentId</FieldLabel>
                <TextInput value={form.agentId} onChange={(event) => setForm({ ...form, agentId: event.target.value })} />
              </div>
              <div>
                <FieldLabel>userWallet</FieldLabel>
                <TextInput value={form.userWallet} onChange={(event) => setForm({ ...form, userWallet: event.target.value })} />
              </div>
              <div>
                <FieldLabel>serviceName</FieldLabel>
                <TextInput value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} />
              </div>
              <div>
                <FieldLabel>amount</FieldLabel>
                <TextInput
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <FieldLabel>reason</FieldLabel>
                <TextArea rows={3} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
              </div>
            </div>

            <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">{text.advanced}</summary>
              <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <DefaultItem label="category" value={form.category} />
                <DefaultItem label="currency" value={form.currency} />
                <DefaultItem label="billingCycle" value={form.billingCycle} />
              </div>
            </details>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? text.loading : text.submit}
              </PrimaryButton>
              <p className="text-sm text-slate-500">{text.ready}</p>
            </div>
            {error ? <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          </form>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{text.resultEyebrow}</p>
                <h2 className="text-lg font-semibold text-slate-950">{text.resultTitle}</h2>
              </div>
              {displayDecision ? (
                <StatusPill tone={decisionTone(displayDecision) as "neutral" | "success" | "warning" | "danger"}>{displayDecision}</StatusPill>
              ) : null}
            </div>

            {result ? (
              <div className="space-y-3">
                <ResultRow label="decision" value={displayDecision || ""} strong />
                <div className="grid grid-cols-2 gap-3">
                  <ResultRow label="riskScore" value={String(result.riskScore)} />
                  <ResultRow label="requiresApproval" value={result.requiresUserApproval ? "true" : "false"} />
                </div>
                <ResultRow label="usageSignal" value={`${result.usageSignal} (${result.usageSignalSource})`} />
                <ResultRow label="mode" value={result.mode} />
                <ResultRow label="analysisHash" value={result.analysisHash} mono />
                <ResultRow label="storageRootHash" value={result.storageRootHash} mono />
                <ResultRow label="contractAddress" value={subscriptionRegistryAddress} mono />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contract Explorer link</p>
                  <a href={contractExplorerUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    {contractExplorerUrl}
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                </div>
                <ResultRow label="latestTransactionHash" value={result.chainTxHash || "API proof only; chain write is completed from the dashboard wallet flow."} mono />
                {explorerUrl ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Explorer link</p>
                    <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                      {explorerUrl}
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  </div>
                ) : null}
                <ResultRow label="reason" value={result.reason} />
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">proofUrl</p>
                  <Link href={proofUrl} className="mt-1 inline-flex items-center gap-2 break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    {proofUrl}
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex min-h-80 items-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {text.emptyResult}
              </div>
            )}
          </aside>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{text.howItWorks}</p>
            <div className="mt-4 space-y-3">
              {text.steps.map((step, index) => (
                <Step key={step} index={String(index + 1)} text={step} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{text.apiEyebrow}</p>
                <h2 className="text-lg font-semibold text-slate-950">{text.apiTitle}</h2>
              </div>
              <StatusPill tone="neutral">POST</StatusPill>
            </div>
            <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              <code>{fetchExample}</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}

function DefaultItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ResultRow({ label, value, strong = false, mono = false }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 break-words text-sm text-slate-900 ${strong ? "font-bold" : "font-semibold"} ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Step({ index, text }: { index: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{index}</div>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
        <span>{text}</span>
        {index === "1" ? <ArrowRight className="hidden h-4 w-4 text-slate-400 sm:block" /> : null}
      </div>
    </div>
  );
}
