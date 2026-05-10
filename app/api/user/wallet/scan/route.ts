import { NextResponse } from "next/server";
import { appendAuditLog, saveWalletIndex } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";
import { scanWalletOverview } from "@/lib/walletScanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const overview = await scanWalletOverview(session.wallet);
  await saveWalletIndex(session.wallet, { approvals: overview.approvals, subscriptions: overview.subscriptions });
  await appendAuditLog({
    id: `audit_wallet_scan_${Date.now()}`,
    userWallet: session.wallet,
    action: "wallet.scan",
    targetType: "wallet",
    targetId: session.wallet,
    metadata: { dataSource: overview.dataSource, approvals: overview.approvals.length, subscriptions: overview.subscriptions.length },
    createdAt: new Date().toISOString()
  });
  return NextResponse.json(overview);
}
