import { RenewalPolicy, SubscriptionItem } from "./types";

export const mockSubscriptions: SubscriptionItem[] = [
  {
    id: "sub-chatgpt",
    serviceName: "ChatGPT Plus",
    category: "AI Tool",
    amount: 20,
    currency: "USDT",
    billingCycle: "monthly",
    nextRenewalDate: "2026-05-18",
    usageScore: 95,
    notes: "Daily coding, research, product writing. Strong renewal candidate."
  },
  {
    id: "sub-midjourney",
    serviceName: "Midjourney",
    category: "AI Tool",
    amount: 30,
    currency: "USDT",
    billingCycle: "monthly",
    nextRenewalDate: "2026-05-22",
    usageScore: 15,
    notes: "Rarely used this month; keep only if design sprint is active."
  },
  {
    id: "sub-cursor",
    serviceName: "Cursor",
    category: "AI Tool",
    amount: 20,
    currency: "USDT",
    billingCycle: "monthly",
    nextRenewalDate: "2026-05-24",
    usageScore: 90,
    notes: "Primary IDE and code assistant."
  },
  {
    id: "sub-notion",
    serviceName: "Notion AI",
    category: "SaaS",
    amount: 10,
    currency: "USDT",
    billingCycle: "monthly",
    nextRenewalDate: "2026-05-30",
    usageScore: 45,
    notes: "Useful for docs, but overlaps with other AI tools."
  },
  {
    id: "sub-random-api",
    serviceName: "Random AI API",
    category: "API",
    amount: 50,
    currency: "USDT",
    billingCycle: "monthly",
    nextRenewalDate: "2026-05-15",
    usageScore: 20,
    notes: "Prototype API no longer used in production."
  }
];

export const defaultPolicy: RenewalPolicy = {
  monthlyBudget: 100,
  priceIncreaseLimit: 15,
  defaultAction: "ask_user",
  requireManualApprovalAbove: 30,
  allowAutoRenewForHighUsage: true,
  manualApprovalAbove: 30,
  trustedServices: ["ChatGPT Plus", "Cursor", "OpenAI", "0G Compute"],
  blockedServices: ["Random AI API"],
  autoApproveBelow: 10,
  requireApprovalForUnknownService: true,
  maxSingleSpend: 100,
  renewalCooldownDays: 7
};
