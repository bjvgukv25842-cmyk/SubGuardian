export type SubscriptionCategory = "AI Tool" | "Web3 Infra" | "SaaS" | "API" | "Other";

export type BillingCycle = "monthly" | "yearly";

export type RenewalDecision = "renew" | "pause" | "reject" | "ask_user";

export type AgentAuthorizationDecision = "allow" | "pause" | "reject" | "ask_user";

export type BudgetStatus = "under_budget" | "near_limit" | "over_budget";

export type RiskLevel = "low" | "medium" | "high";

export type UsageSignal = "high" | "medium" | "low" | "unknown";

export type UnknownServiceAction = "allow" | "ask_user" | "pause" | "reject";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export type SubscriptionStatus = "trusted" | "paused" | "blocked" | "needs_approval";

export type WalletDataSource = "real_wallet_data" | "simulated_demo_data" | "limited_rpc_fallback";

export type IntegrationAuthType = "global_api_key" | "merchant_api_key" | "dev_unconfigured";

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
  manualApprovalAbove?: number;
  trustedServices?: string[];
  blockedServices?: string[];
  autoApproveBelow?: number;
  requireApprovalForUnknownService?: boolean;
  maxSingleSpend?: number;
  renewalCooldownDays?: number;
}

export interface SpendingPolicy {
  monthlyBudget: number;
  manualApprovalAbove: number;
  defaultAction: AgentAuthorizationDecision;
  trustedServices: string[];
  blockedServices: string[];
  autoApproveBelow: number;
  requireApprovalForUnknownService: boolean;
  maxSingleSpend: number;
  renewalCooldownDays: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  unknownServiceAction: UnknownServiceAction;
  emergencyPauseAll: boolean;
  agentPolicies: Record<string, Partial<SpendingPolicyRule>>;
  merchantPolicies: Record<string, Partial<SpendingPolicyRule>>;
}

export interface SpendingPolicyRule {
  defaultAction: AgentAuthorizationDecision;
  maxSingleSpend: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  trusted: boolean;
  blocked: boolean;
  requiresManualApproval: boolean;
}

export interface Recommendation {
  serviceName: string;
  decision: RenewalDecision;
  riskScore: number;
  reason: string;
  estimatedMonthlySaving: number;
  budgetPressure?: BudgetStatus;
  renewalRisk?: RiskLevel;
  requiresUserApproval?: boolean;
  nextAction?: string;
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
  apiAuthConfigured: boolean;
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

export interface AgentSpendCheckRequest {
  agentId: string;
  walletAddress?: string;
  userWallet?: string;
  serviceName: string;
  category: SubscriptionCategory;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  reason: string;
  requestedAt?: string;
  idempotencyKey?: string;
  usageScore?: number;
  usageSignal?: UsageSignal;
}

export interface AgentSpendAuthorizationResult extends AgentSpendCheckRequest {
  decisionId: string;
  proofId: string;
  decision: AgentAuthorizationDecision;
  authorizationDecision: AgentAuthorizationDecision;
  usageScore: number;
  usageSignal: UsageSignal;
  usageSignalSource: "usage_ledger" | "request_override" | "subscription_history" | "no_usage_data" | "inferred_from_recent_activity";
  budgetStatus: BudgetStatus;
  monthlyBudget: number;
  projectedMonthlySpend: number;
  riskScore: number;
  requiresUserApproval: boolean;
  reason: string;
  policySummary: string;
  estimatedMonthlySaving: number;
  analysisHash: `0x${string}`;
  storageRootHash: string;
  chainTxHash: `0x${string}` | "";
  mockChainCommitment: `0x${string}`;
  chainRecorded: boolean;
  zeroGExplorerLink: string;
  traceId: string;
  budgetPressure: BudgetStatus;
  renewalRisk: RiskLevel;
  nextAction: string;
  createdAt: string;
  mockMode: boolean;
  mode: "mock" | "external_llm" | "0g_live";
  idempotencyKey?: string;
}

export interface SpendAuthorizeRequest {
  merchantId?: string;
  agentId: string;
  userWallet: string;
  spender?: string;
  token?: string;
  serviceName: string;
  category?: SubscriptionCategory;
  amount: number;
  currency?: string;
  billingCycle?: BillingCycle;
  reason?: string;
  requestedAt?: string;
  idempotencyKey?: string;
  policy?: Partial<SpendingPolicy> | RenewalPolicy;
}

export interface UsageEvent {
  id: string;
  agentId: string;
  userWallet: string;
  serviceName: string;
  eventType: string;
  units: number;
  cost: number;
  timestamp: string;
  createdAt: string;
}

export interface UsageEventInput {
  agentId: string;
  userWallet: string;
  serviceName: string;
  eventType: string;
  units?: number;
  cost?: number;
  timestamp?: string;
}

export interface StoredDecision extends AgentSpendAuthorizationResult {
  request: SpendAuthorizeRequest;
  policy: SpendingPolicy;
  merchantId?: string;
  spender?: string;
  token?: string;
  finalUserDecision?: "approved" | "rejected";
  policyHash?: `0x${string}`;
  teeVerified?: boolean;
  computeTraceId?: string;
}

export interface AuthNonce {
  nonce: string;
  wallet: string;
  message: string;
  issuedAt: string;
  expiresAt: string;
  used: boolean;
}

export interface WalletSession {
  id: string;
  wallet: string;
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
}

export interface UserRecord {
  id: string;
  wallet: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantRecord {
  id: string;
  name: string;
  ownerWallet?: string;
  agentId?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "revoked";
}

export interface MerchantApiKey {
  id: string;
  merchantId: string;
  keyHash: string;
  label: string;
  createdAt: string;
  revokedAt?: string;
  lastUsedAt?: string;
}

export interface IntegrationAuthContext {
  ok: true;
  authType: IntegrationAuthType;
  merchantId?: string;
  agentId?: string;
  warning?: string;
}

export interface PendingApproval {
  id: string;
  decisionId: string;
  userWallet: string;
  merchantId?: string;
  agentId: string;
  serviceName: string;
  amount: number;
  currency: string;
  token?: string;
  spender?: string;
  reason: string;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedByWallet?: string;
}

export interface DetectedSubscription {
  id: string;
  userWallet: string;
  serviceName: string;
  spender: string;
  token: string;
  amount: number;
  currency: string;
  cadence: "monthly" | "weekly" | "usage-based" | "unknown recurring";
  lastActivityAt: string;
  riskLevel: RiskLevel;
  status: SubscriptionStatus;
  source: WalletDataSource;
}

export interface WalletApproval {
  id: string;
  chainId: number;
  owner: string;
  token: string;
  tokenSymbol: string;
  spender: string;
  allowance: string;
  allowanceDisplay: string;
  lastActivityAt?: string;
  riskLevel: RiskLevel;
  revokeAvailable: boolean;
  source: WalletDataSource;
}

export interface WalletOverview {
  wallet: string;
  chainId: number;
  nativeBalance: string;
  nativeSymbol: string;
  dataSource: WalletDataSource;
  approvals: WalletApproval[];
  subscriptions: DetectedSubscription[];
  riskAlerts: string[];
  scannedAt: string;
  supportedChains: string[];
}

export interface ChainRecord {
  id: string;
  userWallet: string;
  decisionId?: string;
  policyHash?: `0x${string}`;
  decisionHash?: `0x${string}`;
  storageRootHash?: string;
  txHash?: `0x${string}`;
  signerWallet?: string;
  explorerUrl?: string;
  status: "not_recorded" | "recorded" | "failed";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userWallet?: string;
  merchantId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
