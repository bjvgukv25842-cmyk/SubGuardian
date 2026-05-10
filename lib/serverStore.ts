import { promises as fs } from "fs";
import path from "path";
import {
  AuditLog,
  AuthNonce,
  ChainRecord,
  DetectedSubscription,
  MerchantApiKey,
  MerchantRecord,
  PendingApproval,
  SpendingPolicy,
  StoredDecision,
  UsageEvent,
  UserRecord,
  WalletApproval,
  WalletSession
} from "./types";

interface StoreData {
  users: Record<string, UserRecord>;
  sessions: Record<string, WalletSession>;
  authNonces: Record<string, AuthNonce>;
  decisions: Record<string, StoredDecision>;
  idempotency: Record<string, string>;
  usageEvents: UsageEvent[];
  policies: Record<string, SpendingPolicy>;
  pendingApprovals: Record<string, PendingApproval>;
  subscriptions: Record<string, DetectedSubscription[]>;
  approvals: Record<string, WalletApproval[]>;
  merchants: Record<string, MerchantRecord>;
  apiKeys: Record<string, MerchantApiKey>;
  auditLogs: AuditLog[];
  chainRecords: Record<string, ChainRecord>;
}

const initialData: StoreData = {
  users: {},
  sessions: {},
  authNonces: {},
  decisions: {},
  idempotency: {},
  usageEvents: [],
  policies: {},
  pendingApprovals: {},
  subscriptions: {},
  approvals: {},
  merchants: {},
  apiKeys: {},
  auditLogs: [],
  chainRecords: {}
};

const memoryStore: StoreData = structuredClone(initialData);
const storePath = process.env.SUBGUARDIAN_STORE_FILE || path.join(process.cwd(), "tmp", "subguardian-store.json");

export async function upsertUser(wallet: string) {
  const data = await readStore();
  const normalized = normalizeWallet(wallet);
  const now = new Date().toISOString();
  const existing = data.users[normalized];
  const user: UserRecord = existing
    ? { ...existing, updatedAt: now }
    : { id: `user_${normalized.slice(2, 12) || "wallet"}`, wallet, createdAt: now, updatedAt: now };
  data.users[normalized] = user;
  await writeStore(data);
  return user;
}

export async function saveAuthNonce(nonce: AuthNonce) {
  const data = await readStore();
  data.authNonces[nonce.nonce] = nonce;
  await writeStore(data);
  return nonce;
}

export async function consumeAuthNonce(nonce: string, wallet: string) {
  const data = await readStore();
  const record = data.authNonces[nonce];
  if (!record || record.used || normalizeWallet(record.wallet) !== normalizeWallet(wallet) || Date.parse(record.expiresAt) < Date.now()) {
    return null;
  }
  data.authNonces[nonce] = { ...record, used: true };
  await writeStore(data);
  return data.authNonces[nonce];
}

export async function saveSession(session: WalletSession) {
  const data = await readStore();
  data.sessions[session.id] = session;
  await writeStore(data);
  return session;
}

export async function getSession(sessionId: string) {
  const data = await readStore();
  const session = data.sessions[sessionId];
  if (!session || Date.parse(session.expiresAt) < Date.now()) return null;
  return session;
}

export async function deleteSession(sessionId: string) {
  const data = await readStore();
  delete data.sessions[sessionId];
  await writeStore(data);
}

export async function saveDecision(decision: StoredDecision) {
  const data = await readStore();
  data.decisions[decision.decisionId] = decision;
  if (decision.idempotencyKey) {
    data.idempotency[idempotencyKey(decision.userWallet || decision.walletAddress || "", decision.idempotencyKey)] = decision.decisionId;
  }
  await writeStore(data);
  return decision;
}

export async function updateDecision(decisionId: string, patch: Partial<StoredDecision>) {
  const data = await readStore();
  const decision = data.decisions[decisionId];
  if (!decision) return null;
  const updated = { ...decision, ...patch } as StoredDecision;
  data.decisions[decisionId] = updated;
  await writeStore(data);
  return updated;
}

export async function getDecision(decisionId: string) {
  const data = await readStore();
  return data.decisions[decisionId] || null;
}

export async function getDecisionByIdempotency(userWallet: string, key: string) {
  const data = await readStore();
  const decisionId = data.idempotency[idempotencyKey(userWallet, key)];
  return decisionId ? data.decisions[decisionId] || null : null;
}

export async function listDecisions(filter?: { userWallet?: string; serviceName?: string; status?: "pending" | "final" }) {
  const data = await readStore();
  return Object.values(data.decisions)
    .filter((decision) => !filter?.userWallet || equalsIgnoreCase(decision.userWallet || decision.walletAddress || "", filter.userWallet))
    .filter((decision) => !filter?.serviceName || equalsIgnoreCase(decision.serviceName, filter.serviceName))
    .filter((decision) => filter?.status !== "pending" || decision.decision === "ask_user")
    .filter((decision) => filter?.status !== "final" || decision.decision !== "ask_user" || Boolean(decision.finalUserDecision))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function saveUsageEvent(event: UsageEvent) {
  const data = await readStore();
  data.usageEvents.push(event);
  await writeStore(data);
  return event;
}

export async function listUsageEvents(filter?: { userWallet?: string; serviceName?: string; agentId?: string; since?: string }) {
  const data = await readStore();
  const since = filter?.since ? Date.parse(filter.since) : null;
  return data.usageEvents
    .filter((event) => !filter?.userWallet || equalsIgnoreCase(event.userWallet, filter.userWallet))
    .filter((event) => !filter?.serviceName || equalsIgnoreCase(event.serviceName, filter.serviceName))
    .filter((event) => !filter?.agentId || equalsIgnoreCase(event.agentId, filter.agentId))
    .filter((event) => since === null || Date.parse(event.timestamp) >= since)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export async function savePolicy(userWallet: string, policy: SpendingPolicy) {
  const data = await readStore();
  data.policies[normalizeWallet(userWallet)] = policy;
  await writeStore(data);
  return policy;
}

export async function getPolicy(userWallet: string) {
  const data = await readStore();
  return data.policies[normalizeWallet(userWallet)] || null;
}

export async function savePendingApproval(approval: PendingApproval) {
  const data = await readStore();
  data.pendingApprovals[approval.id] = approval;
  await writeStore(data);
  return approval;
}

export async function updatePendingApproval(approvalId: string, patch: Partial<PendingApproval>) {
  const data = await readStore();
  const approval = data.pendingApprovals[approvalId];
  if (!approval) return null;
  const updated = { ...approval, ...patch, updatedAt: new Date().toISOString() };
  data.pendingApprovals[approvalId] = updated;
  await writeStore(data);
  return updated;
}

export async function getPendingApproval(approvalId: string) {
  const data = await readStore();
  return data.pendingApprovals[approvalId] || null;
}

export async function listPendingApprovals(filter?: { userWallet?: string; status?: PendingApproval["status"] }) {
  const data = await readStore();
  return Object.values(data.pendingApprovals)
    .filter((approval) => !filter?.userWallet || equalsIgnoreCase(approval.userWallet, filter.userWallet))
    .filter((approval) => !filter?.status || approval.status === filter.status)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function saveWalletIndex(userWallet: string, index: { subscriptions: DetectedSubscription[]; approvals: WalletApproval[] }) {
  const data = await readStore();
  const wallet = normalizeWallet(userWallet);
  data.subscriptions[wallet] = index.subscriptions;
  data.approvals[wallet] = index.approvals;
  await writeStore(data);
  return index;
}

export async function listSubscriptions(filter?: { userWallet?: string }) {
  const data = await readStore();
  if (filter?.userWallet) return data.subscriptions[normalizeWallet(filter.userWallet)] || [];
  return Object.values(data.subscriptions).flat();
}

export async function updateSubscriptionStatus(userWallet: string, subscriptionId: string, status: DetectedSubscription["status"]) {
  const data = await readStore();
  const wallet = normalizeWallet(userWallet);
  const subscriptions = data.subscriptions[wallet] || [];
  data.subscriptions[wallet] = subscriptions.map((subscription) =>
    subscription.id === subscriptionId ? { ...subscription, status } : subscription
  );
  await writeStore(data);
  return data.subscriptions[wallet].find((subscription) => subscription.id === subscriptionId) || null;
}

export async function listWalletApprovals(filter?: { userWallet?: string }) {
  const data = await readStore();
  if (filter?.userWallet) return data.approvals[normalizeWallet(filter.userWallet)] || [];
  return Object.values(data.approvals).flat();
}

export async function saveMerchant(merchant: MerchantRecord) {
  const data = await readStore();
  data.merchants[merchant.id] = merchant;
  await writeStore(data);
  return merchant;
}

export async function listMerchants(filter?: { ownerWallet?: string }) {
  const data = await readStore();
  return Object.values(data.merchants)
    .filter((merchant) => !filter?.ownerWallet || equalsIgnoreCase(merchant.ownerWallet || "", filter.ownerWallet))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getMerchant(merchantId: string) {
  const data = await readStore();
  return data.merchants[merchantId] || null;
}

export async function saveMerchantApiKey(apiKey: MerchantApiKey) {
  const data = await readStore();
  data.apiKeys[apiKey.id] = apiKey;
  await writeStore(data);
  return apiKey;
}

export async function listMerchantApiKeys(merchantId: string) {
  const data = await readStore();
  return Object.values(data.apiKeys).filter((key) => key.merchantId === merchantId);
}

export async function findMerchantApiKeyByHash(keyHash: string) {
  const data = await readStore();
  return Object.values(data.apiKeys).find((key) => key.keyHash === keyHash && !key.revokedAt) || null;
}

export async function touchMerchantApiKey(keyId: string) {
  const data = await readStore();
  if (data.apiKeys[keyId]) {
    data.apiKeys[keyId].lastUsedAt = new Date().toISOString();
    await writeStore(data);
  }
}

export async function saveChainRecord(record: ChainRecord) {
  const data = await readStore();
  data.chainRecords[record.id] = record;
  await writeStore(data);
  return record;
}

export async function listChainRecords(filter?: { userWallet?: string; decisionId?: string }) {
  const data = await readStore();
  return Object.values(data.chainRecords)
    .filter((record) => !filter?.userWallet || equalsIgnoreCase(record.userWallet, filter.userWallet))
    .filter((record) => !filter?.decisionId || record.decisionId === filter.decisionId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function appendAuditLog(log: AuditLog) {
  const data = await readStore();
  data.auditLogs.push(log);
  await writeStore(data);
  return log;
}

export async function listAuditLogs(filter?: { userWallet?: string; merchantId?: string }) {
  const data = await readStore();
  return data.auditLogs
    .filter((log) => !filter?.userWallet || equalsIgnoreCase(log.userWallet || "", filter.userWallet))
    .filter((log) => !filter?.merchantId || log.merchantId === filter.merchantId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getStoreMode() {
  return process.env.SUBGUARDIAN_DATABASE_URL ? "database_configured_adapter_pending" : "json_file_local_dev_fallback";
}

async function readStore(): Promise<StoreData> {
  if (process.env.SUBGUARDIAN_STORE_MODE === "memory") {
    return structuredClone(memoryStore);
  }

  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return mergeStore(parsed);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return structuredClone(initialData);
    }
    return structuredClone(memoryStore);
  }
}

async function writeStore(data: StoreData) {
  if (process.env.SUBGUARDIAN_STORE_MODE === "memory") {
    Object.assign(memoryStore, structuredClone(data));
    return;
  }

  try {
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(data, null, 2));
  } catch {
    Object.assign(memoryStore, structuredClone(data));
  }
}

function mergeStore(parsed: Partial<StoreData>): StoreData {
  return {
    users: parsed.users || {},
    sessions: parsed.sessions || {},
    authNonces: parsed.authNonces || {},
    decisions: parsed.decisions || {},
    idempotency: parsed.idempotency || {},
    usageEvents: parsed.usageEvents || [],
    policies: parsed.policies || {},
    pendingApprovals: parsed.pendingApprovals || {},
    subscriptions: parsed.subscriptions || {},
    approvals: parsed.approvals || {},
    merchants: parsed.merchants || {},
    apiKeys: parsed.apiKeys || {},
    auditLogs: parsed.auditLogs || [],
    chainRecords: parsed.chainRecords || {}
  };
}

function idempotencyKey(userWallet: string, key: string) {
  return `${normalizeWallet(userWallet)}:${key}`;
}

function normalizeWallet(userWallet: string) {
  return String(userWallet || "").trim().toLowerCase();
}

function equalsIgnoreCase(left: string, right: string) {
  return normalizeWallet(left) === normalizeWallet(right);
}
