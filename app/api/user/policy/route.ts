import { NextResponse } from "next/server";
import { analysisHashBytes32 } from "@/lib/crypto";
import { normalizeSpendingPolicy } from "@/lib/policyEngine";
import { appendAuditLog, getPolicy, savePolicy } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const policy = normalizeSpendingPolicy(await getPolicy(session.wallet));
  return NextResponse.json({ wallet: session.wallet, policy, policyHash: analysisHashBytes32(policy) });
}

export async function PUT(request: Request) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const body = await request.json();
  const policy = normalizeSpendingPolicy(body.policy || body);
  await savePolicy(session.wallet, policy);
  const policyHash = analysisHashBytes32(policy);
  await appendAuditLog({
    id: `audit_${policyHash.slice(2, 18)}`,
    userWallet: session.wallet,
    action: "policy.update",
    targetType: "policy",
    targetId: policyHash,
    metadata: { policyHash },
    createdAt: new Date().toISOString()
  });
  return NextResponse.json({ wallet: session.wallet, policy, policyHash });
}
