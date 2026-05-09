import { AnalysisResult, RenewalPolicy, SubscriptionItem } from "@/lib/types";

export const SUBGUARDIAN_ANALYSIS_PROMPT =
  "You are SubGuardian, a subscription renewal risk analyst for AI and Web3 users. Given a user's subscription list, usage score, next renewal date, monthly budget and renewal policy, return strict JSON. Recommend whether each subscription should be renewed, paused, rejected or manually confirmed. Consider usage score, budget pressure, price, category and renewal date. Do not include markdown. Return only valid JSON.";

interface AnalyzeInput {
  subscriptions: SubscriptionItem[];
  policy: RenewalPolicy;
  walletAddress?: string;
}

export async function analyzeWithZeroGCompute(input: AnalyzeInput): Promise<AnalysisResult> {
  const mockMode = process.env.ENABLE_MOCK_COMPUTE !== "false" || !process.env.ZERO_G_COMPUTE_API_KEY;

  if (mockMode) {
    return mockAnalysis(input);
  }

  return callLiveZeroGCompute(input);
}

async function callLiveZeroGCompute(input: AnalyzeInput): Promise<AnalysisResult> {
  const baseUrl = process.env.ZERO_G_COMPUTE_BASE_URL;
  const apiKey = process.env.ZERO_G_COMPUTE_API_KEY;
  const model = process.env.ZERO_G_COMPUTE_MODEL || "llama-3.3-70b-instruct";

  if (!baseUrl || !apiKey) {
    throw new Error("ZERO_G_COMPUTE_BASE_URL and ZERO_G_COMPUTE_API_KEY are required for live 0G Compute mode.");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      verify_tee: true,
      messages: [
        { role: "system", content: SUBGUARDIAN_ANALYSIS_PROMPT },
        { role: "user", content: JSON.stringify(input) }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`0G Compute request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("0G Compute response did not include JSON content.");
  }

  const parsed = JSON.parse(content) as AnalysisResult;
  return {
    ...parsed,
    teeVerified: Boolean(payload.teeVerified ?? payload.attestation?.verified ?? parsed.teeVerified),
    traceId: String(payload.traceId ?? payload.id ?? parsed.traceId)
  };
}

function mockAnalysis({ subscriptions, policy }: AnalyzeInput): AnalysisResult {
  const monthlyTotal = subscriptions.reduce((total, subscription) => {
    return total + monthlyAmount(subscription.amount, subscription.billingCycle);
  }, 0);

  const recommendations = subscriptions.map((subscription) => {
    const monthly = monthlyAmount(subscription.amount, subscription.billingCycle);
    const isExpensive = monthly >= policy.requireManualApprovalAbove;

    if (subscription.usageScore >= 80 && (!isExpensive || policy.allowAutoRenewForHighUsage)) {
      return {
        serviceName: subscription.serviceName,
        decision: "renew" as const,
        riskScore: Math.max(5, 35 - Math.round(subscription.usageScore / 4)),
        reason: "High usage and clear workflow value. Renewal is justified under the current policy.",
        estimatedMonthlySaving: 0
      };
    }

    if (subscription.usageScore < 25 && monthly >= 30) {
      return {
        serviceName: subscription.serviceName,
        decision: "reject" as const,
        riskScore: 86,
        reason: "Low usage with material monthly cost. Treat this as a renewal firewall block.",
        estimatedMonthlySaving: monthly
      };
    }

    if (subscription.usageScore < 35) {
      return {
        serviceName: subscription.serviceName,
        decision: "pause" as const,
        riskScore: 72,
        reason: "Usage is too low for automatic renewal. Pause and revisit if the service becomes active again.",
        estimatedMonthlySaving: monthly
      };
    }

    if (isExpensive || subscription.usageScore < 60) {
      return {
        serviceName: subscription.serviceName,
        decision: "ask_user" as const,
        riskScore: 55,
        reason: "Moderate value or policy threshold hit. Human confirmation is required before renewal.",
        estimatedMonthlySaving: 0
      };
    }

    return {
      serviceName: subscription.serviceName,
      decision: policy.defaultAction,
      riskScore: 42,
      reason: "No critical issue detected, so the policy default action is applied.",
      estimatedMonthlySaving: policy.defaultAction === "renew" || policy.defaultAction === "ask_user" ? 0 : monthly
    };
  });

  const potentialSavings = recommendations.reduce((total, recommendation) => total + recommendation.estimatedMonthlySaving, 0);
  const budgetRatio = monthlyTotal / Math.max(policy.monthlyBudget, 1);
  const budgetStatus = budgetRatio > 1 ? "over_budget" : budgetRatio > 0.85 ? "near_limit" : "under_budget";
  const overallRisk = budgetStatus === "over_budget" || potentialSavings >= 50 ? "high" : budgetStatus === "near_limit" ? "medium" : "low";

  return {
    overallRisk,
    monthlyTotal,
    budgetLimit: policy.monthlyBudget,
    budgetStatus,
    recommendations,
    summary: `SubGuardian found ${recommendations.filter((item) => item.decision !== "renew").length} subscriptions that should be paused, rejected, or manually reviewed before renewal.`,
    nextActions: [
      "Upload the encrypted subscription profile to 0G Storage.",
      "Record the AI analysis hash and selected renewal decision on 0G Chain.",
      potentialSavings > 0 ? `Potential monthly savings: ${potentialSavings} USDT.` : "No immediate savings action is required."
    ],
    teeVerified: false,
    traceId: `mock-0g-compute-${Date.now()}`
  };
}

function monthlyAmount(amount: number, billingCycle: string) {
  return billingCycle === "yearly" ? Number((amount / 12).toFixed(2)) : amount;
}
