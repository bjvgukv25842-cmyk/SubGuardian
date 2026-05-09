export type SubscriptionCategory = "AI Tool" | "Web3 Infra" | "SaaS" | "API" | "Other";

export type BillingCycle = "monthly" | "yearly";

export type RenewalDecision = "renew" | "pause" | "reject" | "ask_user";

export type BudgetStatus = "under_budget" | "near_limit" | "over_budget";

export type RiskLevel = "low" | "medium" | "high";

export interface SubscriptionItem {
  id: string;
  serviceName: string;
  category: SubscriptionCategory;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
  usageScore: number;
  notes: string;
}

export interface RenewalPolicy {
  monthlyBudget: number;
  priceIncreaseLimit: number;
  defaultAction: RenewalDecision;
  requireManualApprovalAbove: number;
  allowAutoRenewForHighUsage: boolean;
}

export interface Recommendation {
  serviceName: string;
  decision: RenewalDecision;
  riskScore: number;
  reason: string;
  estimatedMonthlySaving: number;
}

export interface AnalysisResult {
  overallRisk: RiskLevel;
  monthlyTotal: number;
  budgetLimit: number;
  budgetStatus: BudgetStatus;
  recommendations: Recommendation[];
  summary: string;
  nextActions: string[];
  teeVerified: boolean;
  traceId: string;
}

export interface StoredProfile {
  user: string;
  subscriptions: SubscriptionItem[];
  policy: RenewalPolicy;
  analysis: AnalysisResult | null;
  createdAt: string;
  project: "SubGuardian";
}

export interface StorageUploadResult {
  storageRootHash: string;
  encrypted: true;
  mockMode: boolean;
  payloadSize: number;
  encryption: {
    algorithm: "AES-256-GCM";
    iv: string;
    authTag: string;
  };
}

export interface DemoLogItem {
  id: string;
  label: string;
  status: "pending" | "success" | "error";
  detail?: string;
  createdAt?: string;
}

export interface HealthResponse {
  app: string;
  mockMode: {
    compute: boolean;
    storage: boolean;
  };
  config: Record<string, boolean>;
  chain: {
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
    contractAddress: string;
  };
}
