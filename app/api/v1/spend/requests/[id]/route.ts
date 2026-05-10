import { NextResponse } from "next/server";
import { validateIntegrationAuth } from "@/lib/apiAuth";
import { getDecision } from "@/lib/serverStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await validateIntegrationAuth(request);
  if (auth instanceof NextResponse) return auth;
  const decision = await getDecision(decodeURIComponent(params.id));
  if (!decision) return NextResponse.json({ error: "Decision not found." }, { status: 404 });
  if (auth.merchantId && decision.merchantId && decision.merchantId !== auth.merchantId) {
    return NextResponse.json({ error: "Decision belongs to another merchant." }, { status: 403 });
  }
  return NextResponse.json({
    decisionId: decision.decisionId,
    decision: decision.decision,
    finalUserDecision: decision.finalUserDecision,
    status: decision.finalUserDecision || (decision.requiresUserApproval ? "pending_user_approval" : "final"),
    riskScore: decision.riskScore,
    reason: decision.reason,
    chainTxHash: decision.chainTxHash || null,
    proofUrl: `/proof/${encodeURIComponent(decision.decisionId)}`
  });
}
