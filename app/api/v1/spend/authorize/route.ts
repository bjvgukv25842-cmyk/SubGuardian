import { NextResponse } from "next/server";
import { validateIntegrationAuth } from "@/lib/apiAuth";
import { evaluateSpendPolicy, normalizeSpendRequest, normalizeSpendingPolicy } from "@/lib/policyEngine";
import {
  appendAuditLog,
  getDecisionByIdempotency,
  getPolicy,
  listDecisions,
  listUsageEvents,
  saveDecision,
  savePendingApproval,
  savePolicy
} from "@/lib/serverStore";
import { SpendAuthorizeRequest, StoredDecision } from "@/lib/types";
import { getAuthorizationMode, persistDecisionSnapshotToZeroG } from "@/lib/zeroG/decisionLog";
import { refineSpendAuthorizationWithZeroGCompute } from "@/lib/zeroG/compute";
import { analysisHashBytes32 } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await validateIntegrationAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as SpendAuthorizeRequest;
    const normalizedRequest = normalizeSpendRequest({
      ...body,
      merchantId: body.merchantId || auth.merchantId,
      agentId: body.agentId || auth.agentId || "unknown-agent"
    });

    if (auth.merchantId && normalizedRequest.merchantId && normalizedRequest.merchantId !== auth.merchantId) {
      return NextResponse.json({ error: "merchantId does not match the API key." }, { status: 403 });
    }

    if (normalizedRequest.idempotencyKey) {
      const existing = await getDecisionByIdempotency(normalizedRequest.userWallet, normalizedRequest.idempotencyKey);
      if (existing) {
        return NextResponse.json({ ...toApiDecision(existing), idempotentReplay: true, authWarning: auth.warning });
      }
    }

    const storedPolicy = await getPolicy(normalizedRequest.userWallet);
    const policy = normalizeSpendingPolicy(storedPolicy || body.policy);
    if (!storedPolicy) await savePolicy(normalizedRequest.userWallet, policy);

    const usageEvents = await listUsageEvents({
      userWallet: normalizedRequest.userWallet,
      serviceName: normalizedRequest.serviceName
    });
    const existingDecisions = await listDecisions({ userWallet: normalizedRequest.userWallet });
    const currentMonthlySpend = getCurrentMonthlySpend(existingDecisions, normalizedRequest.serviceName);
    const mode = getAuthorizationMode();
    const baseSnapshot = {
      type: "subguardian_decision_snapshot",
      version: "v1",
      request: normalizedRequest,
      policy,
      usageEventCount: usageEvents.length,
      currentMonthlySpend,
      mode
    };
    const storageRootHash = await persistDecisionSnapshotToZeroG(baseSnapshot);
    const deterministicResult = evaluateSpendPolicy({
      request: normalizedRequest,
      policy,
      usageEvents,
      currentMonthlySpend,
      storageRootHash,
      chainTxHash: null,
      mode
    });
    const computeOverride =
      mode === "0g_live"
        ? await refineSpendAuthorizationWithZeroGCompute({
            request: normalizedRequest,
            policy,
            usageEvents,
            deterministicDecision: deterministicResult
          })
        : null;
    const result = computeOverride
      ? {
          ...deterministicResult,
          ...computeOverride,
          mode,
          mockMode: false
        }
      : deterministicResult;
    const storedDecision: StoredDecision = {
      ...result,
      request: normalizedRequest,
      policy,
      merchantId: normalizedRequest.merchantId || auth.merchantId,
      spender: normalizedRequest.spender,
      token: normalizedRequest.token,
      policyHash: analysisHashBytes32(policy),
      teeVerified: mode === "0g_live",
      computeTraceId: result.traceId
    };

    await saveDecision(storedDecision);
    if (storedDecision.decision === "ask_user" || storedDecision.requiresUserApproval) {
      await savePendingApproval({
        id: `pa_${storedDecision.decisionId.slice(4)}`,
        decisionId: storedDecision.decisionId,
        userWallet: storedDecision.userWallet || storedDecision.walletAddress || normalizedRequest.userWallet,
        merchantId: storedDecision.merchantId,
        agentId: storedDecision.agentId,
        serviceName: storedDecision.serviceName,
        amount: storedDecision.amount,
        currency: storedDecision.currency,
        token: storedDecision.token,
        spender: storedDecision.spender,
        reason: storedDecision.reason,
        status: "pending",
        createdAt: storedDecision.createdAt,
        updatedAt: storedDecision.createdAt
      });
    }
    await appendAuditLog({
      id: `audit_decision_${storedDecision.decisionId}`,
      userWallet: storedDecision.userWallet || storedDecision.walletAddress || normalizedRequest.userWallet,
      merchantId: storedDecision.merchantId,
      action: "spend.authorize",
      targetType: "decision",
      targetId: storedDecision.decisionId,
      metadata: { decision: storedDecision.decision, authType: auth.authType },
      createdAt: storedDecision.createdAt
    });

    return NextResponse.json({ ...toApiDecision(storedDecision), authWarning: auth.warning });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to authorize spend request." },
      { status: 500 }
    );
  }
}

function toApiDecision(decision: StoredDecision) {
  return {
    decisionId: decision.decisionId,
    decision: decision.decision,
    riskScore: decision.riskScore,
    requiresUserApproval: decision.requiresUserApproval,
    usageSignal: decision.usageSignal,
    usageSignalSource: decision.usageSignalSource,
    budgetStatus: decision.budgetStatus,
    monthlyBudget: decision.monthlyBudget,
    projectedMonthlySpend: decision.projectedMonthlySpend,
    estimatedMonthlySaving: decision.estimatedMonthlySaving,
    reason: decision.reason,
    nextAction: decision.nextAction,
    analysisHash: decision.analysisHash,
    storageRootHash: decision.storageRootHash,
    policyHash: decision.policyHash || analysisHashBytes32(decision.policy),
    teeVerified: Boolean(decision.teeVerified),
    computeTraceId: decision.computeTraceId || decision.traceId,
    chainTxHash: decision.chainTxHash || null,
    proofUrl: `/proof/${encodeURIComponent(decision.decisionId)}`,
    createdAt: decision.createdAt,
    mode: decision.mode,
    merchantId: decision.merchantId,
    spender: decision.spender,
    token: decision.token,
    status: decision.finalUserDecision || (decision.requiresUserApproval ? "pending_user_approval" : "final")
  };
}

function getCurrentMonthlySpend(decisions: StoredDecision[], requestedServiceName: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const latestByService = new Map<string, StoredDecision>();

  for (const decision of decisions) {
    if (!decision.createdAt.startsWith(currentMonth)) continue;
    if (decision.decision === "reject") continue;
    if (decision.serviceName.toLowerCase() === requestedServiceName.toLowerCase()) continue;
    const key = decision.serviceName.toLowerCase();
    const previous = latestByService.get(key);
    if (!previous || Date.parse(decision.createdAt) > Date.parse(previous.createdAt)) {
      latestByService.set(key, decision);
    }
  }

  return Array.from(latestByService.values()).reduce((sum, decision) => {
    const monthly = decision.billingCycle === "yearly" ? decision.amount / 12 : decision.amount;
    return sum + monthly;
  }, 0);
}
