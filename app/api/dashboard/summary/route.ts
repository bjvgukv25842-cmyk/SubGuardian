import { NextResponse } from "next/server";
import { normalizeSpendingPolicy } from "@/lib/policyEngine";
import {
  getPolicy,
  listAuditLogs,
  listChainRecords,
  listDecisions,
  listPendingApprovals,
  listSubscriptions,
  listWalletApprovals
} from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";
import { scanWalletOverview } from "@/lib/walletScanner";
import { StoredDecision } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;

  const wallet = session.wallet;
  const [policy, decisions, pendingApprovals, storedSubscriptions, storedApprovals, chainRecords, auditLogs] = await Promise.all([
    getPolicy(wallet),
    listDecisions({ userWallet: wallet }),
    listPendingApprovals({ userWallet: wallet, status: "pending" }),
    listSubscriptions({ userWallet: wallet }),
    listWalletApprovals({ userWallet: wallet }),
    listChainRecords({ userWallet: wallet }),
    listAuditLogs({ userWallet: wallet })
  ]);
  const walletOverview = storedApprovals.length || storedSubscriptions.length ? null : await scanWalletOverview(wallet);
  const activePolicy = normalizeSpendingPolicy(policy);
  const subscriptions = storedSubscriptions.length ? storedSubscriptions : walletOverview?.subscriptions || [];
  const approvals = storedApprovals.length ? storedApprovals : walletOverview?.approvals || [];

  return NextResponse.json({
    wallet,
    walletOverview: {
      wallet,
      chainId: walletOverview?.chainId || Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID || 16661),
      nativeBalance: walletOverview?.nativeBalance || "0",
      nativeSymbol: walletOverview?.nativeSymbol || "0G",
      dataSource: walletOverview?.dataSource || (storedApprovals.length || storedSubscriptions.length ? "real_wallet_data" : "limited_rpc_fallback"),
      approvals,
      subscriptions,
      riskAlerts: walletOverview?.riskAlerts || buildStoredRiskAlerts(approvals, subscriptions),
      scannedAt: walletOverview?.scannedAt || new Date().toISOString(),
      supportedChains: walletOverview?.supportedChains || ["0G/EVM Mainnet (chainId 16661)"]
    },
    policy: activePolicy,
    activePolicies: summarizePolicies(activePolicy),
    subscriptions,
    pendingApprovals,
    recentDecisions: decisions.slice(0, 8),
    monthlySpendSummary: monthlySpend(decisions),
    riskAlerts: buildStoredRiskAlerts(approvals, subscriptions),
    auditRecords: chainRecords.slice(0, 8),
    auditLogs: auditLogs.slice(0, 8)
  });
}

function monthlySpend(decisions: StoredDecision[]) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const allowed = decisions.filter((decision) => decision.createdAt.startsWith(currentMonth) && decision.decision === "allow");
  return {
    month: currentMonth,
    allowedSpend: allowed.reduce((sum, decision) => sum + Number(decision.amount || 0), 0),
    decisionCount: decisions.filter((decision) => decision.createdAt.startsWith(currentMonth)).length,
    pendingCount: decisions.filter((decision) => decision.createdAt.startsWith(currentMonth) && decision.decision === "ask_user").length
  };
}

function summarizePolicies(policy: ReturnType<typeof normalizeSpendingPolicy>) {
  return [
    `Monthly budget ${policy.monthlyBudget} USDT`,
    `Single spend cap ${policy.maxSingleSpend} USDT`,
    `Manual approval above ${policy.manualApprovalAbove} USDT`,
    `Unknown services: ${policy.unknownServiceAction}`,
    policy.emergencyPauseAll ? "Emergency pause all spending enabled" : "Emergency pause off"
  ];
}

function buildStoredRiskAlerts(approvals: { riskLevel: string }[], subscriptions: { riskLevel: string; status: string }[]) {
  return [
    approvals.some((approval) => approval.riskLevel === "high") ? "High-risk wallet approval detected." : "",
    subscriptions.some((subscription) => subscription.status === "needs_approval") ? "Recurring spend needs user approval." : ""
  ].filter(Boolean);
}
