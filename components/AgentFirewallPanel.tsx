"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, ShieldCheck, ShieldQuestion } from "lucide-react";
import { AgentSpendAuthorizationResult, BillingCycle, RenewalPolicy, SubscriptionCategory, SubscriptionItem } from "@/lib/types";
import { FieldLabel, Panel, PanelHeader, PrimaryButton, SelectInput, StatusPill, TextArea, TextInput } from "@/components/ui";
import { decisionTone, formatMoney } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeDisplayText } from "@/lib/i18n";

const categories: SubscriptionCategory[] = ["AI Tool", "Web3 Infra", "SaaS", "API", "Other"];

interface AgentFirewallForm {
  agentId: string;
  serviceName: string;
  category: SubscriptionCategory;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  reason: string;
}

const defaultForm: AgentFirewallForm = {
  agentId: "research-agent",
  serviceName: "Midjourney",
  category: "AI Tool",
  amount: 30,
  currency: "USDT",
  billingCycle: "monthly",
  reason: "Need image generation for marketing campaign"
};

export function AgentFirewallPanel({
  walletAddress,
  policy,
  subscriptions,
  onChecked
}: {
  walletAddress?: string;
  policy: RenewalPolicy;
  subscriptions: SubscriptionItem[];
  onChecked?: (result: AgentSpendAuthorizationResult) => void;
}) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<AgentFirewallForm>(defaultForm);
  const [result, setResult] = useState<AgentSpendAuthorizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/spend/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userWallet: walletAddress || "0x0000000000000000000000000000000000000000",
          requestedAt: new Date().toISOString(),
          idempotencyKey: `dashboard-${form.agentId}-${form.serviceName}-${form.amount}`,
          policy
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t.agentFirewall.errors.requestFailed);
      }
      setResult(payload);
      persistProof(payload);
      onChecked?.(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.agentFirewall.errors.requestFailed);
    } finally {
      setLoading(false);
    }
  };

  const proofUrl = result ? `/proof/${encodeURIComponent(result.decisionId || result.proofId)}` : "";

  return (
    <Panel className="xl:col-span-2">
      <PanelHeader
        title={t.agentFirewall.title}
        eyebrow={t.agentFirewall.eyebrow}
        action={<ShieldQuestion className="h-5 w-5 text-slate-500" />}
      />
      <p className="mb-5 text-sm leading-6 text-slate-600">{t.agentFirewall.body}</p>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-3 lg:col-span-2">
          <div>
            <FieldLabel>{t.agentFirewall.fields.agentId}</FieldLabel>
            <TextInput value={form.agentId} onChange={(event) => setForm({ ...form, agentId: event.target.value })} />
          </div>
          <div>
            <FieldLabel>{t.agentFirewall.fields.serviceName}</FieldLabel>
            <TextInput value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>{t.agentFirewall.fields.amount}</FieldLabel>
              <TextInput type="number" min={0} value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
            </div>
            <div>
              <FieldLabel>{t.agentFirewall.fields.currency}</FieldLabel>
              <TextInput value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>{t.agentFirewall.fields.category}</FieldLabel>
              <SelectInput value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as SubscriptionCategory })}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t.values.category[category]}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel>{t.agentFirewall.fields.billingCycle}</FieldLabel>
              <SelectInput value={form.billingCycle} onChange={(event) => setForm({ ...form, billingCycle: event.target.value as BillingCycle })}>
                <option value="monthly">{t.values.billingCycle.monthly}</option>
                <option value="yearly">{t.values.billingCycle.yearly}</option>
              </SelectInput>
            </div>
          </div>
          <div>
            <FieldLabel>{t.agentFirewall.fields.reason}</FieldLabel>
            <TextArea
              rows={3}
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder={t.agentFirewall.reasonPlaceholder}
            />
          </div>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {t.agentFirewall.checkButton}
          </PrimaryButton>
          {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        </form>

        <div className="lg:col-span-3">
          {result ? (
            <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t.agentFirewall.resultTitle}</p>
                  <h3 className="text-base font-semibold text-slate-950">{result.serviceName}</h3>
                </div>
                <StatusPill tone={decisionTone(result.decision) as "neutral" | "success" | "warning" | "danger"}>
                  {t.values.decision[result.decision]}
                </StatusPill>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Metric label={t.agentFirewall.authorizationDecision} value={t.values.authorizationDecision[result.authorizationDecision]} />
                <Metric label={t.agentFirewall.riskScore} value={String(result.riskScore)} />
                <Metric label={t.agentFirewall.approvalRequired} value={result.requiresUserApproval ? t.agentFirewall.yes : t.agentFirewall.no} />
              </div>
              <p className="text-sm text-slate-700">{localizeDisplayText(result.reason, language)}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Metric
                  label={t.agentFirewall.usageSignal}
                  value={`${t.values.usageSignal[result.usageSignal]} - ${result.usageSignalSource}`}
                />
                <Metric label={t.agentFirewall.budgetPressure} value={t.values.budgetStatus[result.budgetStatus || result.budgetPressure]} />
                <Metric label={t.agentFirewall.estimatedSaving} value={formatMoney(result.estimatedMonthlySaving, result.currency)} />
                <Metric label={t.agentFirewall.nextAction} value={localizeDisplayText(result.nextAction, language)} />
                <Metric label="Mode" value={result.mode || (result.mockMode ? "mock" : "0g_live")} />
                <Metric label="Decision ID" value={result.decisionId || result.proofId} />
                <Metric label="Storage root hash" value={result.storageRootHash} mono />
                <Metric label="Latest transaction hash" value={result.chainTxHash || "API proof only; use dashboard wallet flow for 0G Chain write."} mono />
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.agentFirewall.analysisHash}</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-800">{result.analysisHash}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.agentFirewall.traceId}</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-800">{result.traceId}</p>
              </div>
              <Link
                href={proofUrl}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                {t.agentFirewall.openProof} <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex h-full min-h-72 items-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              {t.agentFirewall.empty}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function Metric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 break-words text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function persistProof(result: AgentSpendAuthorizationResult) {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem("subguardian-agent-proofs");
  const proofs = existing ? (JSON.parse(existing) as Record<string, AgentSpendAuthorizationResult>) : {};
  proofs[result.decisionId || result.proofId] = result;
  localStorage.setItem("subguardian-agent-proofs", JSON.stringify(proofs));
  localStorage.setItem("subguardian-latest-agent-proof", JSON.stringify(result));
}
