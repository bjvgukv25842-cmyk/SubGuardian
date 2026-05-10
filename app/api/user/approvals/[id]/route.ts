import { NextResponse } from "next/server";
import { appendAuditLog, getPendingApproval, updateDecision, updatePendingApproval } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const body = await request.json();
  const action = String(body.action || "");
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject." }, { status: 400 });
  }
  const approval = await getPendingApproval(decodeURIComponent(params.id));
  if (!approval || approval.userWallet.toLowerCase() !== session.wallet.toLowerCase()) {
    return NextResponse.json({ error: "Pending approval not found for this wallet." }, { status: 404 });
  }
  const now = new Date().toISOString();
  const updatedApproval = await updatePendingApproval(approval.id, {
    status: action === "approve" ? "approved" : "rejected",
    resolvedAt: now,
    resolvedByWallet: session.wallet
  });
  await updateDecision(approval.decisionId, {
    finalUserDecision: action === "approve" ? "approved" : "rejected",
    decision: action === "approve" ? "allow" : "reject",
    authorizationDecision: action === "approve" ? "allow" : "reject",
    requiresUserApproval: false,
    nextAction: action === "approve" ? "Merchant may proceed once it re-checks the decision result." : "Merchant must not proceed."
  });
  await appendAuditLog({
    id: `audit_approval_${Date.now()}`,
    userWallet: session.wallet,
    merchantId: approval.merchantId,
    action: `approval.${action}`,
    targetType: "pending_approval",
    targetId: approval.id,
    createdAt: now
  });
  return NextResponse.json(updatedApproval);
}
