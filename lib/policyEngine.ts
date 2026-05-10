import { analysisHashBytes32, sha256Hex } from "./crypto";
import { defaultPolicy } from "./mockData";
import {
  AgentAuthorizationDecision,
  AgentSpendAuthorizationResult,
  BillingCycle,
  BudgetStatus,
  RenewalPolicy,
  SpendingPolicy,
  SpendingPolicyRule,
  SpendAuthorizeRequest,
  SubscriptionCategory,
  UnknownServiceAction,
  UsageEvent,
  UsageSignal
} from "./types";
import { monthlyAmount } from "./utils";
import { explorerTxUrl } from "./zeroG/chain";

export interface PolicyEvaluationInput {
  request: SpendAuthorizeRequest;
  policy: SpendingPolicy;
  usageEvents: UsageEvent[];
  currentMonthlySpend?: number;
  storageRootHash?: string;
  chainTxHash?: `0x${string}` | null;
  mode: "mock" | "external_llm" | "0g_live";
  createdAt?: string;
}

export interface UsageSignalResult {
  signal: UsageSignal;
  source: AgentSpendAuthorizationResult["usageSignalSource"];
  score: number;
  eventCount: number;
  totalCost: number;
}

export function normalizeSpendingPolicy(policy?: Partial<SpendingPolicy> | RenewalPolicy | null): SpendingPolicy {
  const legacyPolicy = (policy || {}) as Partial<RenewalPolicy & SpendingPolicy>;
  return {
    monthlyBudget: positiveNumber(legacyPolicy.monthlyBudget, defaultPolicy.monthlyBudget),
    manualApprovalAbove: positiveNumber(
      legacyPolicy.manualApprovalAbove ?? legacyPolicy.requireManualApprovalAbove,
      defaultPolicy.requireManualApprovalAbove
    ),
    defaultAction: normalizeAction(legacyPolicy.defaultAction, "ask_user"),
    trustedServices: normalizeServiceList(legacyPolicy.trustedServices, ["ChatGPT Plus", "Cursor", "OpenAI", "0G Compute"]),
    blockedServices: normalizeServiceList(legacyPolicy.blockedServices, ["Random AI API"]),
    autoApproveBelow: positiveNumber(legacyPolicy.autoApproveBelow, 10),
    requireApprovalForUnknownService: legacyPolicy.requireApprovalForUnknownService ?? true,
    maxSingleSpend: positiveNumber(legacyPolicy.maxSingleSpend, 100),
    renewalCooldownDays: positiveNumber(legacyPolicy.renewalCooldownDays, 7),
    dailyLimit: positiveNumber(legacyPolicy.dailyLimit, 50),
    weeklyLimit: positiveNumber(legacyPolicy.weeklyLimit, 250),
    monthlyLimit: positiveNumber(legacyPolicy.monthlyLimit, positiveNumber(legacyPolicy.monthlyBudget, defaultPolicy.monthlyBudget)),
    unknownServiceAction: normalizeUnknownServiceAction(legacyPolicy.unknownServiceAction, "ask_user"),
    emergencyPauseAll: Boolean(legacyPolicy.emergencyPauseAll),
    agentPolicies: normalizeRuleMap(legacyPolicy.agentPolicies),
    merchantPolicies: normalizeRuleMap(legacyPolicy.merchantPolicies)
  };
}

export function spendingPolicyToRenewalPolicy(policy: SpendingPolicy): RenewalPolicy {
  return {
    monthlyBudget: policy.monthlyBudget,
    priceIncreaseLimit: defaultPolicy.priceIncreaseLimit,
    defaultAction: policy.defaultAction === "allow" ? "renew" : policy.defaultAction,
    requireManualApprovalAbove: policy.manualApprovalAbove,
    allowAutoRenewForHighUsage: true,
    manualApprovalAbove: policy.manualApprovalAbove,
    trustedServices: policy.trustedServices,
    blockedServices: policy.blockedServices,
    autoApproveBelow: policy.autoApproveBelow,
    requireApprovalForUnknownService: policy.requireApprovalForUnknownService,
    maxSingleSpend: policy.maxSingleSpend,
    renewalCooldownDays: policy.renewalCooldownDays
  };
}

export function normalizeSpendRequest(request: SpendAuthorizeRequest): Required<Omit<SpendAuthorizeRequest, "policy" | "idempotencyKey">> & {
  idempotencyKey?: string;
  policy?: SpendAuthorizeRequest["policy"];
} {
  const requestedAt = validIsoDate(request.requestedAt) || new Date().toISOString();
  const serviceName = String(request.serviceName || "").trim() || "Unknown service";

  return {
    merchantId: request.merchantId ? String(request.merchantId).trim() : "",
    agentId: String(request.agentId || "unknown-agent").trim(),
    userWallet: String(request.userWallet || "0x0000000000000000000000000000000000000000").trim(),
    spender: request.spender ? String(request.spender).trim() : "",
    token: request.token ? String(request.token).trim() : "",
    serviceName,
    category: request.category || inferCategory(serviceName),
    amount: positiveNumber(request.amount, 0),
    currency: String(request.currency || "USDT").trim().toUpperCase(),
    billingCycle: normalizeBillingCycle(request.billingCycle),
    reason: String(request.reason || "").trim(),
    requestedAt,
    idempotencyKey: request.idempotencyKey ? String(request.idempotencyKey).trim() : undefined,
    policy: request.policy
  };
}

export function evaluateSpendPolicy(input: PolicyEvaluationInput): AgentSpendAuthorizationResult {
  const createdAt = input.createdAt || new Date().toISOString();
  const request = normalizeSpendRequest(input.request);
  const usage = getUsageSignal(input.usageEvents, request.requestedAt);
  const requestedMonthlyAmount = monthlyAmount(request.amount, request.billingCycle);
  const projectedMonthlySpend = Number(((input.currentMonthlySpend || 0) + requestedMonthlyAmount).toFixed(2));
  const effectivePolicy = getEffectivePolicy(input.policy, request.agentId, request.merchantId);
  const budgetStatus = getBudgetStatus(projectedMonthlySpend, effectivePolicy.monthlyBudget);
  const serviceStatus = getServiceStatus(request.serviceName, effectivePolicy);
  const vagueReason = isVagueReason(request.reason);
  const riskScore = scoreRisk({
    amount: request.amount,
    requestedMonthlyAmount,
    policy: effectivePolicy,
    usageSignal: usage.signal,
    budgetStatus,
    projectedMonthlySpend,
    serviceStatus,
    vagueReason
  });
  const decision = decide({
    riskScore,
    usageSignal: usage.signal,
    budgetStatus,
    serviceStatus,
    requestedMonthlyAmount,
    policy: effectivePolicy,
    vagueReason
  });
  const requiresUserApproval =
    decision === "ask_user" ||
    decision === "pause" ||
    decision === "reject" ||
    request.amount >= effectivePolicy.manualApprovalAbove ||
    (serviceStatus === "unknown" && effectivePolicy.requireApprovalForUnknownService);
  const reason = explain({
    decision,
    usageSignal: usage.signal,
    budgetStatus,
    serviceStatus,
    vagueReason,
    requestedMonthlyAmount,
    currency: request.currency,
    projectedMonthlySpend,
    policy: effectivePolicy
  });
  const nextAction = nextActionFor(decision, requiresUserApproval);
  const estimatedMonthlySaving = decision === "allow" ? 0 : requestedMonthlyAmount;
  const decisionId = `dec_${sha256Hex({
    idempotencyKey: request.idempotencyKey,
    agentId: request.agentId,
    userWallet: request.userWallet,
    serviceName: request.serviceName,
    amount: request.amount,
    requestedAt: request.requestedAt,
    createdAt
  }).slice(0, 24)}`;
  const proofId = decisionId;
  const storageRootHash =
    input.storageRootHash ||
    `0g-mock-${sha256Hex({ decisionId, request, policy: effectivePolicy, createdAt }).slice(0, 48)}`;
  const analysisPayload = {
    type: "subguardian_pre_spend_authorization",
    version: "v1",
    decisionId,
    request,
    usage,
    policy: effectivePolicy,
    budgetStatus,
    projectedMonthlySpend,
    riskScore,
    decision,
    requiresUserApproval,
    reason,
    nextAction,
    mode: input.mode,
    createdAt
  };
  const analysisHash = analysisHashBytes32(analysisPayload);
  const chainTxHash = input.chainTxHash || "";
  const mockChainCommitment = `0x${sha256Hex({ analysisHash, storageRootHash, decisionId, project: "SubGuardian" })}` as `0x${string}`;

  return {
    agentId: request.agentId,
    userWallet: request.userWallet,
    walletAddress: request.userWallet,
    serviceName: request.serviceName,
    category: request.category,
    amount: request.amount,
    currency: request.currency,
    billingCycle: request.billingCycle,
    requestedAt: request.requestedAt,
    idempotencyKey: request.idempotencyKey,
    decisionId,
    proofId,
    decision,
    authorizationDecision: decision,
    usageScore: usage.score,
    usageSignal: usage.signal,
    usageSignalSource: usage.source,
    riskScore,
    requiresUserApproval,
    budgetStatus,
    budgetPressure: budgetStatus,
    monthlyBudget: effectivePolicy.monthlyBudget,
    projectedMonthlySpend,
    reason,
    policySummary: policySummary(effectivePolicy, request.currency),
    estimatedMonthlySaving,
    analysisHash,
    storageRootHash,
    chainTxHash,
    mockChainCommitment,
    chainRecorded: Boolean(chainTxHash),
    zeroGExplorerLink: chainTxHash ? explorerTxUrl(chainTxHash) : "",
    traceId: decisionId,
    renewalRisk: riskScore >= 70 ? "high" : riskScore >= 45 ? "medium" : "low",
    nextAction,
    createdAt,
    mockMode: input.mode === "mock",
    mode: input.mode
  } satisfies AgentSpendAuthorizationResult;
}

export function getUsageSignal(events: UsageEvent[], requestedAt = new Date().toISOString()): UsageSignalResult {
  const requestTime = Date.parse(requestedAt);
  const end = Number.isFinite(requestTime) ? requestTime : Date.now();
  const start = end - 30 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter((event) => {
    const timestamp = Date.parse(event.timestamp);
    return Number.isFinite(timestamp) && timestamp >= start && timestamp <= end;
  });
  const eventCount = recentEvents.length;
  const totalUnits = recentEvents.reduce((sum, event) => sum + positiveNumber(event.units, 0), 0);
  const totalCost = Number(recentEvents.reduce((sum, event) => sum + positiveNumber(event.cost, 0), 0).toFixed(2));

  if (!events.length) {
    return { signal: "unknown", source: "no_usage_data", score: 10, eventCount: 0, totalCost: 0 };
  }

  if (eventCount >= 10 || totalUnits >= 100 || totalCost >= 20) {
    return { signal: "high", source: "usage_ledger", score: 88, eventCount, totalCost };
  }

  if (eventCount >= 3 || totalUnits >= 25 || totalCost >= 5) {
    return { signal: "medium", source: "usage_ledger", score: 58, eventCount, totalCost };
  }

  if (eventCount >= 1 || totalUnits > 0 || totalCost > 0) {
    return { signal: "low", source: "usage_ledger", score: 28, eventCount, totalCost };
  }

  return { signal: "low", source: "usage_ledger", score: 20, eventCount, totalCost };
}

function decide({
  riskScore,
  usageSignal,
  budgetStatus,
  serviceStatus,
  requestedMonthlyAmount,
  policy,
  vagueReason
}: {
  riskScore: number;
  usageSignal: UsageSignal;
  budgetStatus: BudgetStatus;
  serviceStatus: "trusted" | "blocked" | "unknown";
  requestedMonthlyAmount: number;
  policy: SpendingPolicy;
  vagueReason: boolean;
}): AgentAuthorizationDecision {
  if (policy.emergencyPauseAll) return "pause";
  if (policy.defaultAction === "reject" && policy.maxSingleSpend === 0) return "reject";
  if (requestedMonthlyAmount > policy.dailyLimit || requestedMonthlyAmount > policy.weeklyLimit || requestedMonthlyAmount > policy.monthlyLimit) {
    return "reject";
  }
  if (serviceStatus === "blocked") return "reject";
  if (requestedMonthlyAmount > policy.maxSingleSpend) return "reject";
  if (serviceStatus === "unknown" && policy.unknownServiceAction !== "allow") return policy.unknownServiceAction;
  if (serviceStatus === "unknown" && policy.requireApprovalForUnknownService && requestedMonthlyAmount >= policy.autoApproveBelow) {
    return riskScore >= 72 ? "pause" : "ask_user";
  }
  if (usageSignal === "low" && requestedMonthlyAmount >= policy.manualApprovalAbove) return riskScore >= 82 ? "reject" : "pause";
  if (usageSignal === "unknown" && requestedMonthlyAmount >= policy.autoApproveBelow) return riskScore >= 80 ? "pause" : "ask_user";
  if (budgetStatus === "over_budget" && usageSignal !== "high") return riskScore >= 84 ? "reject" : "pause";
  if (riskScore >= 86) return "reject";
  if (riskScore >= 68) return "pause";
  if (requestedMonthlyAmount >= policy.manualApprovalAbove || vagueReason) return "ask_user";
  if (serviceStatus === "trusted" && usageSignal === "high" && budgetStatus !== "over_budget") return "allow";
  if (requestedMonthlyAmount <= policy.autoApproveBelow && budgetStatus === "under_budget" && usageSignal !== "unknown") return "allow";
  if (usageSignal === "high" && budgetStatus === "under_budget") return "allow";
  return policy.defaultAction;
}

function scoreRisk({
  amount,
  requestedMonthlyAmount,
  policy,
  usageSignal,
  budgetStatus,
  projectedMonthlySpend,
  serviceStatus,
  vagueReason
}: {
  amount: number;
  requestedMonthlyAmount: number;
  policy: SpendingPolicy;
  usageSignal: UsageSignal;
  budgetStatus: BudgetStatus;
  projectedMonthlySpend: number;
  serviceStatus: "trusted" | "blocked" | "unknown";
  vagueReason: boolean;
}) {
  let score = 12;
  const budgetRatio = projectedMonthlySpend / Math.max(policy.monthlyBudget, 1);

  if (serviceStatus === "blocked") score += 80;
  if (policy.emergencyPauseAll) score += 60;
  if (serviceStatus === "unknown") score += policy.requireApprovalForUnknownService ? 16 : 8;
  if (serviceStatus === "trusted") score -= 8;

  if (amount > policy.maxSingleSpend) score += 42;
  if (requestedMonthlyAmount > policy.dailyLimit || requestedMonthlyAmount > policy.weeklyLimit || requestedMonthlyAmount > policy.monthlyLimit) {
    score += 45;
  }
  if (requestedMonthlyAmount >= policy.manualApprovalAbove) score += 18;
  else if (requestedMonthlyAmount > policy.autoApproveBelow) score += 8;

  if (budgetStatus === "over_budget") score += 28;
  else if (budgetStatus === "near_limit") score += 14;
  if (budgetRatio > 1.5) score += 10;

  if (usageSignal === "unknown") score += 24;
  if (usageSignal === "low") score += 24;
  if (usageSignal === "medium") score += 8;
  if (usageSignal === "high") score -= 12;

  if (vagueReason) score += 14;

  return clamp(Math.round(score), 1, 99);
}

function explain({
  decision,
  usageSignal,
  budgetStatus,
  serviceStatus,
  vagueReason,
  requestedMonthlyAmount,
  currency,
  projectedMonthlySpend,
  policy
}: {
  decision: AgentAuthorizationDecision;
  usageSignal: UsageSignal;
  budgetStatus: BudgetStatus;
  serviceStatus: "trusted" | "blocked" | "unknown";
  vagueReason: boolean;
  requestedMonthlyAmount: number;
  currency: string;
  projectedMonthlySpend: number;
  policy: SpendingPolicy;
}) {
  const blockers = [
    serviceStatus === "blocked" ? "the service is blocked by policy" : "",
    serviceStatus === "unknown" ? "the service is not in the trusted list" : "",
    usageSignal === "unknown" ? "there is no usage ledger data" : "",
    usageSignal === "low" ? "recent usage is low" : "",
    budgetStatus === "over_budget" ? "projected monthly spend exceeds the budget" : "",
    budgetStatus === "near_limit" ? "projected monthly spend is near the budget limit" : "",
    requestedMonthlyAmount >= policy.manualApprovalAbove ? "the amount crosses the manual approval threshold" : "",
    policy.emergencyPauseAll ? "emergency pause is enabled" : "",
    requestedMonthlyAmount > policy.dailyLimit ? "the request exceeds the daily limit" : "",
    requestedMonthlyAmount > policy.weeklyLimit ? "the request exceeds the weekly limit" : "",
    requestedMonthlyAmount > policy.monthlyLimit ? "the request exceeds the monthly limit" : "",
    vagueReason ? "the spend reason is missing or vague" : ""
  ].filter(Boolean);

  if (decision === "allow") {
    return `This spend is allowed because recent usage is ${usageSignal}, the service is ${serviceStatus}, and projected monthly spend is ${projectedMonthlySpend} ${currency} against a ${policy.monthlyBudget} ${currency} budget.`;
  }

  if (decision === "reject") {
    return `This spend should be rejected because ${blockers.join(", ") || "the request violates the spending policy"}.`;
  }

  if (decision === "pause") {
    return `This renewal should be paused because ${blockers.join(", ") || "risk is elevated under the current policy"}.`;
  }

  return `This spend requires explicit user approval because ${blockers.join(", ") || "the policy requires a human checkpoint before spending"}.`;
}

function nextActionFor(decision: AgentAuthorizationDecision, requiresUserApproval: boolean) {
  if (decision === "allow") return "Allow the payment, renewal, or paid API call and keep this proof for audit.";
  if (decision === "reject") return "Block payment unless the user creates an explicit exception.";
  if (requiresUserApproval) return "Hold payment and request explicit user approval before spending.";
  return "Pause payment and retry after new usage or policy data is available.";
}

function getServiceStatus(serviceName: string, policy: SpendingPolicy): "trusted" | "blocked" | "unknown" {
  const normalized = normalizeServiceName(serviceName);
  if (policy.blockedServices.some((service) => normalizeServiceName(service) === normalized)) return "blocked";
  if (policy.trustedServices.some((service) => normalizeServiceName(service) === normalized)) return "trusted";
  return "unknown";
}

function getBudgetStatus(projectedMonthlySpend: number, monthlyBudget: number): BudgetStatus {
  const ratio = projectedMonthlySpend / Math.max(monthlyBudget, 1);
  if (ratio > 1) return "over_budget";
  if (ratio >= 0.85) return "near_limit";
  return "under_budget";
}

function policySummary(policy: SpendingPolicy, currency: string) {
  return `Monthly budget: ${policy.monthlyBudget} ${currency}, daily/weekly/monthly limits: ${policy.dailyLimit}/${policy.weeklyLimit}/${policy.monthlyLimit} ${currency}, manual approval above ${policy.manualApprovalAbove} ${currency}, auto-approve below ${policy.autoApproveBelow} ${currency}.`;
}

function getEffectivePolicy(policy: SpendingPolicy, agentId?: string, merchantId?: string): SpendingPolicy {
  const agentRule = agentId ? policy.agentPolicies[agentId] || policy.agentPolicies[agentId.toLowerCase()] : undefined;
  const merchantRule = merchantId ? policy.merchantPolicies[merchantId] || policy.merchantPolicies[merchantId.toLowerCase()] : undefined;
  return applyPolicyRule(applyPolicyRule(policy, merchantRule), agentRule);
}

function applyPolicyRule(policy: SpendingPolicy, rule?: Partial<SpendingPolicyRule>): SpendingPolicy {
  if (!rule) return policy;
  if (rule.blocked) {
    return {
      ...policy,
      defaultAction: "reject",
      unknownServiceAction: "reject",
      maxSingleSpend: 0,
      requireApprovalForUnknownService: true
    };
  }
  return {
    ...policy,
    defaultAction: rule.defaultAction || policy.defaultAction,
    maxSingleSpend: positiveNumber(rule.maxSingleSpend, policy.maxSingleSpend),
    dailyLimit: positiveNumber(rule.dailyLimit, policy.dailyLimit),
    weeklyLimit: positiveNumber(rule.weeklyLimit, policy.weeklyLimit),
    monthlyLimit: positiveNumber(rule.monthlyLimit, policy.monthlyLimit),
    requireApprovalForUnknownService: rule.requiresManualApproval ?? policy.requireApprovalForUnknownService,
    trustedServices: rule.trusted === true ? policy.trustedServices : policy.trustedServices,
    blockedServices: policy.blockedServices
  };
}

function normalizeAction(value: unknown, fallback: AgentAuthorizationDecision): AgentAuthorizationDecision {
  if (value === "renew") return "allow";
  if (value === "allow" || value === "pause" || value === "reject" || value === "ask_user") return value;
  return fallback;
}

function normalizeUnknownServiceAction(value: unknown, fallback: UnknownServiceAction): UnknownServiceAction {
  if (value === "allow" || value === "ask_user" || value === "pause" || value === "reject") return value;
  return fallback;
}

function normalizeRuleMap(value: unknown): Record<string, Partial<SpendingPolicyRule>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value as Record<string, Partial<SpendingPolicyRule>>);
  return entries.reduce<Record<string, Partial<SpendingPolicyRule>>>((rules, [key, rule]) => {
    if (!key || !rule || typeof rule !== "object") return rules;
    rules[key] = {
      defaultAction: normalizeAction(rule.defaultAction, "ask_user"),
      maxSingleSpend: optionalPositiveNumber(rule.maxSingleSpend),
      dailyLimit: optionalPositiveNumber(rule.dailyLimit),
      weeklyLimit: optionalPositiveNumber(rule.weeklyLimit),
      monthlyLimit: optionalPositiveNumber(rule.monthlyLimit),
      trusted: typeof rule.trusted === "boolean" ? rule.trusted : undefined,
      blocked: typeof rule.blocked === "boolean" ? rule.blocked : undefined,
      requiresManualApproval: typeof rule.requiresManualApproval === "boolean" ? rule.requiresManualApproval : undefined
    };
    rules[key.toLowerCase()] = rules[key];
    return rules;
  }, {});
}

function normalizeBillingCycle(value: unknown): BillingCycle {
  return value === "yearly" ? "yearly" : "monthly";
}

function inferCategory(serviceName: string): SubscriptionCategory {
  const normalized = serviceName.toLowerCase();
  if (/(rpc|node|indexer|storage|compute|gateway|api|alchemy|infura|0g)/.test(normalized)) return "API";
  if (/(chatgpt|openai|cursor|claude|midjourney|runway|copilot|perplexity|elevenlabs)/.test(normalized)) return "AI Tool";
  if (/(notion|slack|linear|figma|github)/.test(normalized)) return "SaaS";
  return "Other";
}

function isVagueReason(reason: string) {
  const normalized = reason.trim().toLowerCase();
  return normalized.length < 12 || /^(n\/a|na|unknown|none|test|misc|because|needed?)$/.test(normalized);
}

function normalizeServiceList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.map((item) => String(item || "").trim()).filter(Boolean);
  return normalized.length ? normalized : fallback;
}

function normalizeServiceName(serviceName: string) {
  return String(serviceName || "").trim().toLowerCase();
}

function positiveNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function optionalPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function validIsoDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
