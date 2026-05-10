"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeDollarSign, CheckCircle2, Clock, Database, FileCheck2, Loader2, ShieldAlert, WalletCards } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PrimaryButton, SecondaryButton, StatusPill } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";
import { decisionTone, formatAddress, formatMoney } from "@/lib/utils";

interface SummaryState {
  wallet: string;
  walletOverview: {
    nativeBalance: string;
    nativeSymbol: string;
    dataSource: string;
    approvals: Array<{ id: string; tokenSymbol: string; spender: string; riskLevel: string; allowanceDisplay: string }>;
    subscriptions: Array<{ id: string; serviceName: string; status: string; cadence: string; riskLevel: string }>;
    riskAlerts: string[];
  };
  policy: {
    monthlyBudget: number;
    maxSingleSpend: number;
    emergencyPauseAll: boolean;
  };
  activePolicies: string[];
  pendingApprovals: Array<{ id: string; serviceName: string; amount: number; currency: string; status: string }>;
  recentDecisions: Array<{ decisionId: string; serviceName: string; decision: string; riskScore: number; proofUrl?: string; createdAt: string }>;
  monthlySpendSummary: { month: string; allowedSpend: number; decisionCount: number; pendingCount: number };
  riskAlerts: string[];
  auditRecords: Array<{ id: string; txHash?: string; status: string; decisionId?: string }>;
}

export function DashboardClient() {
  const { p } = useLanguage();
  const [summary, setSummary] = useState<SummaryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/summary", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || p.dashboard.loadFailed);
      setSummary(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : p.dashboard.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [p.dashboard.loadFailed]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardShell>
      {loading ? (
        <InlineState icon={<Loader2 className="h-5 w-5 animate-spin" />} title={p.dashboard.loadingTitle} body={p.dashboard.loadingBody} />
      ) : error ? (
        <InlineState
          icon={<WalletCards className="h-5 w-5" />}
          title={p.dashboard.sessionRequired}
          body={error}
          action={<LinkButton href="/" label={p.dashboard.openProductEntry} />}
        />
      ) : summary ? (
        <DashboardContent summary={summary} onRefresh={load} />
      ) : null}
    </DashboardShell>
  );
}

function DashboardContent({ summary, onRefresh }: { summary: SummaryState; onRefresh: () => void }) {
  const { p } = useLanguage();
  const alerts = useMemo(() => [...summary.walletOverview.riskAlerts, ...summary.riskAlerts].filter(Boolean).slice(0, 4), [summary]);
  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{p.dashboard.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{formatAddress(summary.wallet)}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{p.dashboard.boundary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={summary.walletOverview.dataSource === "real_wallet_data" ? "success" : "warning"}>
            {summary.walletOverview.dataSource === "real_wallet_data" ? p.common.realWalletData : p.common.limitedRpcFallback}
          </StatusPill>
          <SecondaryButton type="button" onClick={onRefresh}>{p.common.refresh}</SecondaryButton>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<BadgeDollarSign className="h-5 w-5 text-emerald-700" />} label={p.dashboard.metrics.monthlyAllowedSpend} value={formatMoney(summary.monthlySpendSummary.allowedSpend)} />
        <Metric icon={<Clock className="h-5 w-5 text-amber-700" />} label={p.dashboard.metrics.pendingApprovals} value={String(summary.pendingApprovals.length)} />
        <Metric icon={<ShieldAlert className="h-5 w-5 text-rose-700" />} label={p.dashboard.metrics.highRiskApprovals} value={String(summary.walletOverview.approvals.filter((item) => item.riskLevel === "high").length)} />
        <Metric icon={<Database className="h-5 w-5 text-cyan-700" />} label={p.dashboard.metrics.auditRecords} value={String(summary.auditRecords.length)} />
      </section>

      {alerts.length ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            {p.dashboard.riskAlerts}
          </div>
          <div className="mt-2 grid gap-2 text-sm text-amber-900 md:grid-cols-2">
            {alerts.map((alert) => (
              <p key={alert}>{alert}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title={p.dashboard.activePolicies} action={<LinkButton href="/dashboard/policies" label={p.common.manage} />}>
          <div className="space-y-2">
            {summary.activePolicies.map((policy) => (
              <div key={policy} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                {policy}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={p.dashboard.pendingSpendRequests} action={<LinkButton href="/dashboard/approvals" label={p.common.review} />}>
          {summary.pendingApprovals.length ? (
            <div className="space-y-2">
              {summary.pendingApprovals.slice(0, 4).map((approval) => (
                <div key={approval.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <div>
                    <p className="font-semibold text-slate-950">{approval.serviceName}</p>
                    <p className="text-sm text-slate-500">{formatMoney(approval.amount, approval.currency)}</p>
                  </div>
                  <StatusPill tone="warning">{approval.status}</StatusPill>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">{p.dashboard.noPendingApprovals}</p>
          )}
        </Panel>

        <Panel title={p.dashboard.detectedSubscriptions} action={<LinkButton href="/dashboard/subscriptions" label={p.common.open} />}>
          <div className="space-y-2">
            {summary.walletOverview.subscriptions.slice(0, 5).map((subscription) => (
              <div key={subscription.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-slate-950">{subscription.serviceName}</p>
                  <p className="text-sm text-slate-500">{subscription.cadence}</p>
                </div>
                <StatusPill tone={subscription.status === "blocked" ? "danger" : subscription.status === "trusted" ? "success" : "warning"}>
                  {subscription.status}
                </StatusPill>
              </div>
            ))}
            {!summary.walletOverview.subscriptions.length ? <p className="text-sm text-slate-600">{p.dashboard.noSubscriptions}</p> : null}
          </div>
        </Panel>

        <Panel title={p.dashboard.recentDecisions} action={<LinkButton href="/dashboard/audit" label={p.common.audit} />}>
          <div className="space-y-2">
            {summary.recentDecisions.slice(0, 5).map((decision) => (
              <Link key={decision.decisionId} href={`/proof/${encodeURIComponent(decision.decisionId)}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-950">{decision.serviceName}</p>
                  <p className="text-sm text-slate-500">{p.dashboard.riskPrefix} {decision.riskScore}/100</p>
                </div>
                <StatusPill tone={decisionTone(decision.decision) as "neutral" | "success" | "warning" | "danger"}>{decision.decision}</StatusPill>
              </Link>
            ))}
            {!summary.recentDecisions.length ? <p className="text-sm text-slate-600">{p.dashboard.noDecisions}</p> : null}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function InlineState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex items-center gap-2 text-slate-950">
        {icon}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex min-h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
      {label}
    </Link>
  );
}
