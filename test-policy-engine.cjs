process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "commonjs",
  moduleResolution: "node"
});
require("ts-node/register/transpile-only");

const { expect } = require("chai");
const { evaluateSpendPolicy, normalizeSpendingPolicy } = require("./lib/policyEngine");
const { hashApiKey } = require("./lib/apiAuth");
const { parseApprovalLogLike } = require("./lib/walletScanner");
const store = require("./lib/serverStore");

const userWallet = "0x1111111111111111111111111111111111111111";
const tests = [];

function run(name, test) {
  tests.push({ name, test });
}

run("idempotency produces stable decision and analysis hashes", () => {
  const request = baseRequest({ idempotencyKey: "agent-run-123-midjourney-renewal" });
  const first = evaluateSpendPolicy({
    request,
    policy: normalizeSpendingPolicy(),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    createdAt: "2026-05-09T12:00:00.000Z"
  });
  const second = evaluateSpendPolicy({
    request,
    policy: normalizeSpendingPolicy(),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    createdAt: "2026-05-09T12:00:00.000Z"
  });

  expect(second.decisionId).to.equal(first.decisionId);
  expect(second.analysisHash).to.equal(first.analysisHash);
});

run("blocked services are rejected", () => {
  const result = evaluateSpendPolicy({
    request: baseRequest({ serviceName: "Random AI API", amount: 5 }),
    policy: normalizeSpendingPolicy({ blockedServices: ["Random AI API"] }),
    usageEvents: highUsageEvents("Random AI API"),
    currentMonthlySpend: 0,
    mode: "mock"
  });

  expect(result.decision).to.equal("reject");
  expect(result.requiresUserApproval).to.equal(true);
});

run("over-budget spend is paused or rejected", () => {
  const result = evaluateSpendPolicy({
    request: baseRequest({ serviceName: "Midjourney", amount: 30 }),
    policy: normalizeSpendingPolicy({ monthlyBudget: 40, trustedServices: ["Midjourney"], blockedServices: [] }),
    usageEvents: lowUsageEvents("Midjourney"),
    currentMonthlySpend: 30,
    mode: "mock"
  });

  expect(result.budgetStatus).to.equal("over_budget");
  expect(["pause", "reject"]).to.include(result.decision);
});

run("low-usage high spend is held", () => {
  const result = evaluateSpendPolicy({
    request: baseRequest({ serviceName: "Midjourney", amount: 45 }),
    policy: normalizeSpendingPolicy({ trustedServices: ["Midjourney"], blockedServices: [], manualApprovalAbove: 30 }),
    usageEvents: lowUsageEvents("Midjourney"),
    currentMonthlySpend: 0,
    mode: "mock"
  });

  expect(result.usageSignal).to.equal("low");
  expect(["pause", "reject"]).to.include(result.decision);
  expect(result.requiresUserApproval).to.equal(true);
});

run("usage events improve a future decision", () => {
  const policy = normalizeSpendingPolicy({
    trustedServices: ["Midjourney"],
    blockedServices: [],
    manualApprovalAbove: 50,
    monthlyBudget: 100
  });
  const request = baseRequest({ serviceName: "Midjourney", amount: 30 });
  const before = evaluateSpendPolicy({
    request,
    policy,
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    createdAt: "2026-05-09T12:00:00.000Z"
  });
  const after = evaluateSpendPolicy({
    request,
    policy,
    usageEvents: highUsageEvents("Midjourney"),
    currentMonthlySpend: 0,
    mode: "mock",
    createdAt: "2026-05-09T12:00:00.000Z"
  });

  expect(before.usageSignal).to.equal("unknown");
  expect(after.usageSignal).to.equal("high");
  expect(after.riskScore).to.be.lessThan(before.riskScore);
  expect(after.decision).to.equal("allow");
});

run("emergency pause holds all spending", () => {
  const result = evaluateSpendPolicy({
    request: baseRequest({ serviceName: "ChatGPT Plus", amount: 5 }),
    policy: normalizeSpendingPolicy({ emergencyPauseAll: true, trustedServices: ["ChatGPT Plus"], blockedServices: [] }),
    usageEvents: highUsageEvents("ChatGPT Plus"),
    currentMonthlySpend: 0,
    mode: "mock"
  });

  expect(result.decision).to.equal("pause");
});

run("wallet approval parser flags unlimited approvals", () => {
  const approval = parseApprovalLogLike({
    owner: userWallet,
    token: "0x2222222222222222222222222222222222222222",
    tokenSymbol: "USDT",
    spender: "0x3333333333333333333333333333333333333333",
    allowance: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  });

  expect(approval.riskLevel).to.equal("high");
  expect(approval.allowanceDisplay).to.equal("unlimited");
});

run("API key auth hashes keys instead of storing raw secrets", () => {
  const key = "sg_live_test_secret";
  expect(hashApiKey(key)).to.equal(hashApiKey(key));
  expect(hashApiKey(key)).to.not.include(key);
});

run("mock/live mode labeling stays explicit", () => {
  const mockResult = evaluateSpendPolicy({
    request: baseRequest({ idempotencyKey: "mode-label" }),
    policy: normalizeSpendingPolicy(),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    createdAt: "2026-05-09T12:00:00.000Z"
  });
  const liveResult = evaluateSpendPolicy({
    request: baseRequest({ idempotencyKey: "mode-label-live" }),
    policy: normalizeSpendingPolicy(),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "0g_live",
    createdAt: "2026-05-09T12:00:00.000Z"
  });

  expect(mockResult.mode).to.equal("mock");
  expect(mockResult.mockMode).to.equal(true);
  expect(liveResult.mode).to.equal("0g_live");
  expect(liveResult.mockMode).to.equal(false);
});

run("chainTxHash null vs recorded states are distinct", () => {
  const apiProofOnly = evaluateSpendPolicy({
    request: baseRequest({ idempotencyKey: "chain-null" }),
    policy: normalizeSpendingPolicy(),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    chainTxHash: null,
    createdAt: "2026-05-09T12:00:00.000Z"
  });
  const recorded = evaluateSpendPolicy({
    request: baseRequest({ idempotencyKey: "chain-recorded" }),
    policy: normalizeSpendingPolicy(),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    chainTxHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    createdAt: "2026-05-09T12:00:00.000Z"
  });

  expect(apiProofOnly.chainTxHash).to.equal("");
  expect(apiProofOnly.chainRecorded).to.equal(false);
  expect(recorded.chainRecorded).to.equal(true);
  expect(recorded.zeroGExplorerLink).to.include("/tx/");
});

run("session wallet ownership check rejects another wallet", async () => {
  process.env.SUBGUARDIAN_STORE_MODE = "memory";
  const owner = "0x4444444444444444444444444444444444444444";
  const other = "0x5555555555555555555555555555555555555555";
  await store.savePolicy(owner, normalizeSpendingPolicy({ monthlyBudget: 12 }));
  const ownerPolicy = await store.getPolicy(owner);
  const otherPolicy = await store.getPolicy(other);

  expect(ownerPolicy.monthlyBudget).to.equal(12);
  expect(otherPolicy).to.equal(null);
});

run("ask_user creates a pending approval shape", async () => {
  process.env.SUBGUARDIAN_STORE_MODE = "memory";
  const result = evaluateSpendPolicy({
    request: baseRequest({ serviceName: "Unknown SaaS", amount: 20, idempotencyKey: "pending-approval" }),
    policy: normalizeSpendingPolicy({ trustedServices: [], blockedServices: [], unknownServiceAction: "ask_user" }),
    usageEvents: [],
    currentMonthlySpend: 0,
    mode: "mock",
    createdAt: "2026-05-09T12:00:00.000Z"
  });
  await store.savePendingApproval({
    id: `pa_${result.decisionId.slice(4)}`,
    decisionId: result.decisionId,
    userWallet: result.userWallet,
    agentId: result.agentId,
    serviceName: result.serviceName,
    amount: result.amount,
    currency: result.currency,
    reason: result.reason,
    status: "pending",
    createdAt: result.createdAt,
    updatedAt: result.createdAt
  });
  const approvals = await store.listPendingApprovals({ userWallet, status: "pending" });

  expect(result.decision).to.equal("ask_user");
  expect(approvals).to.have.length(1);
  expect(approvals[0].decisionId).to.equal(result.decisionId);
});

(async () => {
  for (const { name, test } of tests) {
    await test();
    console.log(`ok - ${name}`);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function baseRequest(overrides = {}) {
  return {
    agentId: "research-agent",
    userWallet,
    serviceName: "Midjourney",
    category: "AI Tool",
    amount: 30,
    currency: "USDT",
    billingCycle: "monthly",
    reason: "Need image generation for marketing campaign",
    requestedAt: "2026-05-09T12:00:00.000Z",
    ...overrides
  };
}

function highUsageEvents(serviceName) {
  return Array.from({ length: 12 }, (_, index) => usageEvent(serviceName, index, 12, 2.5));
}

function lowUsageEvents(serviceName) {
  return [usageEvent(serviceName, 1, 1, 0.5)];
}

function usageEvent(serviceName, daysAgo, units, cost) {
  const timestamp = new Date(Date.parse("2026-05-09T12:00:00.000Z") - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `usage-${serviceName}-${daysAgo}`,
    agentId: "research-agent",
    userWallet,
    serviceName,
    eventType: "api_call",
    units,
    cost,
    timestamp,
    createdAt: timestamp
  };
}
