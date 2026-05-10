import { AgentSpendAuthorizationResult, AnalysisResult, BudgetStatus, RenewalPolicy, SpendAuthorizeRequest, SpendingPolicy, SubscriptionItem, UsageEvent } from "@/lib/types";

export const SUBGUARDIAN_ANALYSIS_PROMPT =
  "You are SubGuardian, an AI Agent Spending Firewall for AI and Web3 users. Given a user's subscription list, usage score, next renewal date, monthly budget and renewal policy, return strict JSON for a pre-spend authorization review. Recommend whether each renewal should be allowed, paused, rejected or manually confirmed before an AI agent can spend. Consider usage score, budget pressure, price, category, renewal date and manual approval thresholds. For each recommendation include budgetPressure, renewalRisk, requiresUserApproval and nextAction. Do not include markdown. Return only valid JSON.";

export const SUBGUARDIAN_SPEND_AUTHORIZATION_PROMPT =
  "You are SubGuardian, a pre-spend authorization firewall for AI agents. Review the request, user policy, usage ledger summary, budget status and deterministic policy result. Return strict JSON with optional overrides: decision, riskScore, reason, nextAction, requiresUserApproval. Never approve blocked services, spends above maxSingleSpend, or over-budget low-usage spend. Do not include markdown.";

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

export async function refineSpendAuthorizationWithZeroGCompute(input: {
  request: SpendAuthorizeRequest;
  policy: SpendingPolicy;
  usageEvents: UsageEvent[];
  deterministicDecision: AgentSpendAuthorizationResult;
}): Promise<Partial<AgentSpendAuthorizationResult> | null> {
  const mockMode = process.env.ENABLE_MOCK_COMPUTE !== "false" || !process.env.ZERO_G_COMPUTE_API_KEY;

  if (mockMode) {
    return null;
  }

  const baseUrl = process.env.ZERO_G_COMPUTE_BASE_URL;
  const apiKey = process.env.ZERO_G_COMPUTE_API_KEY;
  const model = process.env.ZERO_G_COMPUTE_MODEL || "llama-3.3-70b-instruct";

  if (!baseUrl || !apiKey) {
    return null;
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
        { role: "system", content: SUBGUARDIAN_SPEND_AUTHORIZATION_PROMPT },
        { role: "user", content: JSON.stringify(input) }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`0G Compute spend authorization request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return null;
  }

  const parsed = JSON.parse(content) as Partial<AgentSpendAuthorizationResult>;
  return sanitizeSpendAuthorizationOverride(parsed);
}

function sanitizeSpendAuthorizationOverride(parsed: Partial<AgentSpendAuthorizationResult>) {
  const decision = parsed.decision;
  const sanitized: Partial<AgentSpendAuthorizationResult> = {};

  if (decision === "allow" || decision === "pause" || decision === "reject" || decision === "ask_user") {
    sanitized.decision = decision;
    sanitized.authorizationDecision = decision;
  }
  if (typeof parsed.riskScore === "number" && Number.isFinite(parsed.riskScore)) {
    sanitized.riskScore = Math.min(99, Math.max(1, Math.round(parsed.riskScore)));
  }
  if (typeof parsed.requiresUserApproval === "boolean") {
    sanitized.requiresUserApproval = parsed.requiresUserApproval;
  }
  if (typeof parsed.reason === "string" && parsed.reason.trim()) {
    sanitized.reason = parsed.reason.trim();
  }
  if (typeof parsed.nextAction === "string" && parsed.nextAction.trim()) {
    sanitized.nextAction = parsed.nextAction.trim();
  }

  return sanitized;
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
    const projectedBudgetStatus = getBudgetStatus(monthlyTotal, policy.monthlyBudget);

    if (subscription.usageScore >= 80 && (!isExpensive || policy.allowAutoRenewForHighUsage)) {
      return {
        serviceName: subscription.serviceName,
        decision: "renew" as const,
        riskScore: Math.max(5, 35 - Math.round(subscription.usageScore / 4)),
        reason: "Pre-spend authorization passed. High usage and clear workflow value make this renewal safe under the current policy.",
        estimatedMonthlySaving: 0,
        budgetPressure: projectedBudgetStatus,
        renewalRisk: "low" as const,
        requiresUserApproval: isExpensive && !policy.allowAutoRenewForHighUsage,
        nextAction: "Allow the renewal and record the analysis hash for audit."
      };
    }

    if (subscription.usageScore < 25 && monthly >= 30) {
      return {
        serviceName: subscription.serviceName,
        decision: "reject" as const,
        riskScore: 86,
        reason: "Pre-spend authorization blocked. Low usage with material monthly cost makes this a renewal firewall stop.",
        estimatedMonthlySaving: monthly,
        budgetPressure: projectedBudgetStatus,
        renewalRisk: "high" as const,
        requiresUserApproval: true,
        nextAction: "Block the renewal unless the user creates a new policy exception."
      };
    }

    if (subscription.usageScore < 35) {
      return {
        serviceName: subscription.serviceName,
        decision: "pause" as const,
        riskScore: 72,
        reason: "Pre-spend authorization paused. Usage is too low for automatic renewal, so the agent should not spend without approval.",
        estimatedMonthlySaving: monthly,
        budgetPressure: projectedBudgetStatus,
        renewalRisk: "high" as const,
        requiresUserApproval: true,
        nextAction: "Hold the agent payment and ask the user whether this tool is still needed."
      };
    }

    if (isExpensive || subscription.usageScore < 60) {
      return {
        serviceName: subscription.serviceName,
        decision: "ask_user" as const,
        riskScore: 55,
        reason: "Pre-spend authorization requires explicit user approval because value is moderate or the policy threshold was hit.",
        estimatedMonthlySaving: 0,
        budgetPressure: projectedBudgetStatus,
        renewalRisk: "medium" as const,
        requiresUserApproval: true,
        nextAction: "Request user approval before any wallet, API, or renewal spend."
      };
    }

    return {
      serviceName: subscription.serviceName,
      decision: policy.defaultAction,
      riskScore: 42,
      reason: "Pre-spend authorization used the policy default because no critical renewal issue was detected.",
      estimatedMonthlySaving: policy.defaultAction === "renew" || policy.defaultAction === "ask_user" ? 0 : monthly,
      budgetPressure: projectedBudgetStatus,
      renewalRisk: "medium" as const,
      requiresUserApproval: policy.defaultAction !== "renew",
      nextAction: policy.defaultAction === "renew" ? "Allow the renewal under policy default." : "Pause and ask the user to confirm this spend."
    };
  });

  const potentialSavings = recommendations.reduce((total, recommendation) => total + recommendation.estimatedMonthlySaving, 0);
  const budgetRatio = monthlyTotal / Math.max(policy.monthlyBudget, 1);
  const budgetStatus = getBudgetStatus(monthlyTotal, policy.monthlyBudget);
  const overallRisk = budgetStatus === "over_budget" || potentialSavings >= 50 ? "high" : budgetStatus === "near_limit" ? "medium" : "low";

  return {
    overallRisk,
    monthlyTotal,
    budgetLimit: policy.monthlyBudget,
    budgetStatus,
    recommendations,
    summary: `Pre-spend authorization result: SubGuardian found ${recommendations.filter((item) => item.decision !== "renew").length} renewals that an AI agent should pause, block, or manually confirm before spending.`,
    nextActions: [
      "Upload the encrypted spending profile to 0G Storage.",
      "Record the AI analysis hash and selected authorization decision on 0G Chain.",
      potentialSavings > 0 ? `Potential monthly savings: ${potentialSavings} USDT.` : "No immediate savings action is required."
    ],
    teeVerified: false,
    traceId: `mock-0g-compute-${Date.now()}`
  };
}

function monthlyAmount(amount: number, billingCycle: string) {
  return billingCycle === "yearly" ? Number((amount / 12).toFixed(2)) : amount;
}

function getBudgetStatus(monthlyTotal: number, monthlyBudget: number): BudgetStatus {
  const budgetRatio = monthlyTotal / Math.max(monthlyBudget, 1);
  return budgetRatio > 1 ? "over_budget" : budgetRatio > 0.85 ? "near_limit" : "under_budget";
}
