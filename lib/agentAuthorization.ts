import { evaluateSpendPolicy, normalizeSpendingPolicy } from "@/lib/policyEngine";
import {
  AgentSpendAuthorizationResult,
  AgentSpendCheckRequest,
  RenewalPolicy,
  SpendAuthorizeRequest,
  SubscriptionItem,
  UsageEvent
} from "@/lib/types";
import { monthlyAmount } from "@/lib/utils";

interface AgentAuthorizationInput {
  request: AgentSpendCheckRequest;
  policy?: RenewalPolicy;
  subscriptions?: SubscriptionItem[];
  usageEvents?: UsageEvent[];
}

export async function authorizeAgentSpend({
  request,
  policy,
  subscriptions = [],
  usageEvents = []
}: AgentAuthorizationInput): Promise<AgentSpendAuthorizationResult> {
  const spendRequest: SpendAuthorizeRequest = {
    agentId: request.agentId,
    userWallet: request.userWallet || request.walletAddress || "0x0000000000000000000000000000000000000000",
    serviceName: request.serviceName,
    category: request.category,
    amount: request.amount,
    currency: request.currency,
    billingCycle: request.billingCycle,
    reason: request.reason,
    requestedAt: request.requestedAt,
    idempotencyKey: request.idempotencyKey,
    policy
  };
  const spendingPolicy = normalizeSpendingPolicy(policy);
  const currentMonthlySpend = subscriptions
    .filter((subscription) => subscription.serviceName.toLowerCase() !== request.serviceName.toLowerCase())
    .reduce((total, subscription) => total + monthlyAmount(subscription.amount, subscription.billingCycle), 0);

  return evaluateSpendPolicy({
    request: spendRequest,
    policy: spendingPolicy,
    usageEvents: usageEvents.length ? usageEvents : usageEventsFromSubscriptions(subscriptions),
    currentMonthlySpend,
    mode: process.env.ENABLE_MOCK_COMPUTE !== "false" || !process.env.ZERO_G_COMPUTE_API_KEY ? "mock" : "0g_live"
  });
}

function usageEventsFromSubscriptions(subscriptions: SubscriptionItem[]): UsageEvent[] {
  const now = new Date();
  return subscriptions.flatMap((subscription) => {
    if (subscription.usageScore <= 0) return [];
    const count = subscription.usageScore >= 70 ? 10 : subscription.usageScore >= 45 ? 4 : subscription.usageScore >= 20 ? 1 : 0;
    return Array.from({ length: count }, (_, index) => ({
      id: `legacy_usage_${subscription.id}_${index}`,
      agentId: "dashboard-simulator",
      userWallet: "0x0000000000000000000000000000000000000000",
      serviceName: subscription.serviceName,
      eventType: "legacy_subscription_usage",
      units: Math.max(1, Math.round(subscription.usageScore / 10)),
      cost: Number((subscription.amount / Math.max(count, 1)).toFixed(2)),
      timestamp: new Date(now.getTime() - index * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString()
    }));
  });
}
