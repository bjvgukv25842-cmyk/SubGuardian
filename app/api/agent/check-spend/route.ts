import { NextResponse } from "next/server";
import { authorizeAgentSpend } from "@/lib/agentAuthorization";
import { normalizeSpendingPolicy } from "@/lib/policyEngine";
import { saveDecision } from "@/lib/serverStore";
import { StoredDecision } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authorization = await authorizeAgentSpend({
      request: body,
      policy: body.policy,
      subscriptions: body.subscriptions
    });
    const storedDecision: StoredDecision = {
      ...authorization,
      request: {
        agentId: authorization.agentId,
        userWallet: authorization.userWallet || authorization.walletAddress || "",
        serviceName: authorization.serviceName,
        category: authorization.category,
        amount: authorization.amount,
        currency: authorization.currency,
        billingCycle: authorization.billingCycle,
        reason: body.reason || "",
        requestedAt: authorization.requestedAt,
        idempotencyKey: authorization.idempotencyKey
      },
      policy: normalizeSpendingPolicy(body.policy)
    };
    await saveDecision(storedDecision);

    return NextResponse.json(authorization);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check agent spend request." },
      { status: 500 }
    );
  }
}
