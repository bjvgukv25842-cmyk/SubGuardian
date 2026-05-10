"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, RefreshCcw, ShieldAlert, X } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useLanguage } from "@/components/LanguageProvider";
import { PrimaryButton, SecondaryButton, StatusPill } from "@/components/ui";
import { decisionTone, formatAddress, formatMoney } from "@/lib/utils";

type Summary = {
  wallet: string;
  walletOverview: {
    dataSource: string;
    nativeBalance: string;
    nativeSymbol: string;
    approvals: Array<{ id: string; tokenSymbol: string; spender: string; allowanceDisplay: string; riskLevel: string; revokeAvailable: boolean; source: string }>;
    subscriptions: Array<{ id: string; serviceName: string; spender: string; token: string; amount: number; currency: string; cadence: string; status: string; riskLevel: string; source: string }>;
  };
  pendingApprovals: Array<{ id: string; decisionId: string; serviceName: string; amount: number; currency: string; reason: string; spender?: string; status: string }>;
  recentDecisions: Array<{ decisionId: string; serviceName: string; decision: string; riskScore: number; storageRootHash: string; chainTxHash?: string | null; mode: string }>;
  auditRecords: Array<{ id: string; decisionId?: string; txHash?: string; status: string; explorerUrl?: string }>;
};

export function SubscriptionsClient() {
  const { p } = useLanguage();
  const { summary, loading, error, reload } = useSummary();
  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/user/subscriptions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    reload();
  };

  return (
    <DashboardShell>
      <PageHeader title={p.listPages.subscriptions.title} eyebrow={p.listPages.subscriptions.eyebrow} body={p.listPages.subscriptions.body} />
      <LoadState loading={loading} error={error} />
      {summary ? (
        <section className="space-y-3">
          {summary.walletOverview.subscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{subscription.serviceName}</p>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {subscription.cadence} / {p.listPages.subscriptions.spender} {subscription.spender}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={subscription.source === "real_wallet_data" ? "success" : "warning"}>{subscription.source}</StatusPill>
                  <StatusPill tone={subscription.riskLevel === "high" ? "danger" : subscription.riskLevel === "medium" ? "warning" : "success"}>{subscription.riskLevel}</StatusPill>
                  <StatusPill tone={subscription.status === "blocked" ? "danger" : subscription.status === "trusted" ? "success" : "warning"}>{subscription.status}</StatusPill>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["trusted", "paused", "blocked", "needs_approval"].map((status) => (
                  <SecondaryButton key={status} type="button" onClick={() => updateStatus(subscription.id, status)}>
                    {status}
                  </SecondaryButton>
                ))}
              </div>
            </div>
          ))}
          {!summary.walletOverview.subscriptions.length ? <Empty body={p.listPages.subscriptions.empty} /> : null}
        </section>
      ) : null}
    </DashboardShell>
  );
}

export function ApprovalsClient() {
  const { p } = useLanguage();
  const { summary, loading, error, reload } = useSummary();
  const resolve = async (id: string, action: "approve" | "reject") => {
    await fetch(`/api/user/approvals/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    reload();
  };
  return (
    <DashboardShell>
      <PageHeader title={p.listPages.approvals.title} eyebrow={p.listPages.approvals.eyebrow} body={p.listPages.approvals.body} />
      <LoadState loading={loading} error={error} />
      {summary ? (
        <section className="space-y-3">
          {summary.pendingApprovals.map((approval) => (
            <div key={approval.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{approval.serviceName}</p>
                  <p className="text-sm text-slate-500">{formatMoney(approval.amount, approval.currency)}</p>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">{approval.reason}</p>
                  {approval.spender ? <p className="mt-1 break-all text-xs text-slate-500">{p.listPages.approvals.spender} {approval.spender}</p> : null}
                </div>
                <StatusPill tone="warning">{approval.status}</StatusPill>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton type="button" onClick={() => resolve(approval.id, "approve")}>
                  <Check className="h-4 w-4" />
                  {p.listPages.approvals.approve}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => resolve(approval.id, "reject")}>
                  <X className="h-4 w-4" />
                  {p.listPages.approvals.reject}
                </SecondaryButton>
                <Link href={`/proof/${encodeURIComponent(approval.decisionId)}`} className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  {p.common.proof}
                </Link>
              </div>
            </div>
          ))}
          {!summary.pendingApprovals.length ? <Empty body={p.listPages.approvals.empty} /> : null}
        </section>
      ) : null}
    </DashboardShell>
  );
}

export function WalletClient() {
  const { p } = useLanguage();
  const { summary, loading, error, reload } = useSummary();
  const [scanning, setScanning] = useState(false);
  const scan = async () => {
    setScanning(true);
    await fetch("/api/user/wallet/scan", { method: "POST" }).catch(() => undefined);
    setScanning(false);
    reload();
  };
  return (
    <DashboardShell>
      <PageHeader title={p.listPages.wallet.title} eyebrow={p.listPages.wallet.eyebrow} body={p.listPages.wallet.body} />
      <div className="mb-4">
        <PrimaryButton type="button" onClick={scan} disabled={scanning}>
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          {p.listPages.wallet.scan}
        </PrimaryButton>
      </div>
      <LoadState loading={loading} error={error} />
      {summary ? (
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <p className="text-sm text-slate-500">{p.listPages.wallet.walletLabel}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-950">{summary.wallet}</p>
            <p className="mt-2 text-sm text-slate-600">
              {p.listPages.wallet.balance} {summary.walletOverview.nativeBalance} {summary.walletOverview.nativeSymbol}
            </p>
            <div className="mt-3">
              <StatusPill tone={summary.walletOverview.dataSource === "real_wallet_data" ? "success" : "warning"}>{summary.walletOverview.dataSource}</StatusPill>
            </div>
          </div>
          {summary.walletOverview.approvals.map((approval) => (
            <div key={approval.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{approval.tokenSymbol} {p.listPages.wallet.approval}</p>
                  <p className="break-all text-sm text-slate-500">{p.listPages.wallet.spender} {approval.spender}</p>
                  <p className="mt-1 text-sm text-slate-600">{p.listPages.wallet.allowance} {approval.allowanceDisplay}</p>
                </div>
                <StatusPill tone={approval.riskLevel === "high" ? "danger" : approval.riskLevel === "medium" ? "warning" : "success"}>{approval.riskLevel}</StatusPill>
              </div>
              <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {p.listPages.wallet.revokeNote}
              </p>
            </div>
          ))}
          {!summary.walletOverview.approvals.length ? <Empty body={p.listPages.wallet.empty} /> : null}
        </section>
      ) : null}
    </DashboardShell>
  );
}

export function AuditClient() {
  const { p } = useLanguage();
  const { summary, loading, error } = useSummary();
  return (
    <DashboardShell>
      <PageHeader title={p.listPages.audit.title} eyebrow={p.listPages.audit.eyebrow} body={p.listPages.audit.body} />
      <LoadState loading={loading} error={error} />
      {summary ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <h2 className="font-semibold text-slate-950">{p.listPages.audit.recentProofs}</h2>
            <div className="mt-3 space-y-2">
              {summary.recentDecisions.map((decision) => (
                <Link key={decision.decisionId} href={`/proof/${encodeURIComponent(decision.decisionId)}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950">{decision.serviceName}</p>
                    <StatusPill tone={decisionTone(decision.decision) as "neutral" | "success" | "warning" | "danger"}>{decision.decision}</StatusPill>
                  </div>
                  <p className="mt-1 break-all font-mono text-xs text-slate-500">{decision.storageRootHash}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <h2 className="font-semibold text-slate-950">{p.listPages.audit.chainRecords}</h2>
            <div className="mt-3 space-y-2">
              {summary.auditRecords.map((record) => (
                <div key={record.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-slate-950">{record.decisionId || record.id}</p>
                    <StatusPill tone={record.status === "recorded" ? "success" : "warning"}>{record.status}</StatusPill>
                  </div>
                  {record.explorerUrl ? (
                    <a href={record.explorerUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 break-all text-sm font-semibold text-emerald-700">
                      {p.listPages.audit.explorer} <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              ))}
              {!summary.auditRecords.length ? <Empty body={p.listPages.audit.empty} /> : null}
            </div>
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}

function useSummary() {
  const { p } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/summary", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || p.listPages.loadFailed);
      setSummary(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : p.listPages.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [p.listPages.loadFailed]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { summary, loading, error, reload };
}

function PageHeader({ title, eyebrow, body }: { title: string; eyebrow: string; body: string }) {
  return (
    <div className="mb-5 border-b border-slate-200 pb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function LoadState({ loading, error }: { loading: boolean; error: string }) {
  const { p } = useLanguage();
  if (loading) return <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{p.common.loading}</p>;
  if (error) return <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>;
  return null;
}

function Empty({ body }: { body: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      <ShieldAlert className="mb-2 h-4 w-4 text-slate-500" />
      {body}
    </div>
  );
}
