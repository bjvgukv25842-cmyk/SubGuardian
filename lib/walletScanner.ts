import { JsonRpcProvider, formatEther } from "ethers";
import { sha256Hex } from "./crypto";
import { DetectedSubscription, WalletApproval, WalletDataSource, WalletOverview } from "./types";
import { zeroGChainId, zeroGRpcUrl } from "./zeroG/chain";

const supportedChains = ["0G/EVM Mainnet (chainId 16661)", "Any EVM RPC configured through NEXT_PUBLIC_0G_RPC_URL"];

export async function scanWalletOverview(wallet: string): Promise<WalletOverview> {
  const scannedAt = new Date().toISOString();
  try {
    const provider = new JsonRpcProvider(zeroGRpcUrl, zeroGChainId);
    const balance = await provider.getBalance(wallet);
    const approvals = await scanKnownApprovals(wallet, "real_wallet_data");
    const subscriptions = detectRecurringSubscriptions(wallet, approvals, "real_wallet_data");
    return {
      wallet,
      chainId: zeroGChainId,
      nativeBalance: formatEther(balance),
      nativeSymbol: "0G",
      dataSource: "real_wallet_data",
      approvals,
      subscriptions,
      riskAlerts: buildRiskAlerts(approvals, subscriptions),
      scannedAt,
      supportedChains
    };
  } catch {
    const approvals = await scanKnownApprovals(wallet, "limited_rpc_fallback");
    const subscriptions = detectRecurringSubscriptions(wallet, approvals, "limited_rpc_fallback");
    return {
      wallet,
      chainId: zeroGChainId,
      nativeBalance: "0",
      nativeSymbol: "0G",
      dataSource: "limited_rpc_fallback",
      approvals,
      subscriptions,
      riskAlerts: [
        "RPC scan could not read complete wallet history. Showing indexed/local fallback data only.",
        ...buildRiskAlerts(approvals, subscriptions)
      ],
      scannedAt,
      supportedChains
    };
  }
}

export async function scanKnownApprovals(wallet: string, source: WalletDataSource): Promise<WalletApproval[]> {
  const configuredTokens = parseConfiguredTokens();
  if (!configuredTokens.length) {
    return [];
  }

  return configuredTokens.map((token, index) => {
    const allowanceDisplay = token.allowance || "unknown";
    return {
      id: `approval_${sha256Hex(`${wallet}:${token.address}:${token.spender}:${index}`).slice(0, 20)}`,
      chainId: zeroGChainId,
      owner: wallet,
      token: token.address,
      tokenSymbol: token.symbol,
      spender: token.spender,
      allowance: token.allowance || "0",
      allowanceDisplay,
      lastActivityAt: token.lastActivityAt,
      riskLevel: allowanceDisplay === "unlimited" || token.unlimited ? "high" : "medium",
      revokeAvailable: true,
      source
    };
  });
}

export function detectRecurringSubscriptions(
  wallet: string,
  approvals: WalletApproval[],
  source: WalletDataSource
): DetectedSubscription[] {
  return approvals.map((approval) => ({
    id: `sub_${sha256Hex(`${wallet}:${approval.spender}:${approval.token}`).slice(0, 20)}`,
    userWallet: wallet,
    serviceName: inferServiceName(approval.spender, approval.tokenSymbol),
    spender: approval.spender,
    token: approval.token,
    amount: approval.riskLevel === "high" ? 0 : 10,
    currency: approval.tokenSymbol,
    cadence: approval.riskLevel === "high" ? "usage-based" : "unknown recurring",
    lastActivityAt: approval.lastActivityAt || new Date().toISOString(),
    riskLevel: approval.riskLevel,
    status: approval.riskLevel === "high" ? "needs_approval" : "trusted",
    source
  }));
}

export function parseApprovalLogLike(input: {
  owner: string;
  token: string;
  tokenSymbol?: string;
  spender: string;
  allowance: string;
  chainId?: number;
}): WalletApproval {
  const unlimited =
    input.allowance === "unlimited" ||
    input.allowance.toLowerCase() === "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  return {
    id: `approval_${sha256Hex(input).slice(0, 20)}`,
    chainId: input.chainId || zeroGChainId,
    owner: input.owner,
    token: input.token,
    tokenSymbol: input.tokenSymbol || "ERC20",
    spender: input.spender,
    allowance: input.allowance,
    allowanceDisplay: unlimited ? "unlimited" : input.allowance,
    riskLevel: unlimited ? "high" : Number(input.allowance) > 0 ? "medium" : "low",
    revokeAvailable: true,
    source: "real_wallet_data"
  };
}

function parseConfiguredTokens() {
  const raw = process.env.SUBGUARDIAN_KNOWN_APPROVALS || "";
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw) as Array<{
      address: string;
      symbol: string;
      spender: string;
      allowance?: string;
      unlimited?: boolean;
      lastActivityAt?: string;
    }>;
  } catch {
    return [];
  }
}

function inferServiceName(spender: string, tokenSymbol: string) {
  return `${tokenSymbol} approval ${spender.slice(0, 6)}...${spender.slice(-4)}`;
}

function buildRiskAlerts(approvals: WalletApproval[], subscriptions: DetectedSubscription[]) {
  const alerts: string[] = [];
  const highRiskApprovals = approvals.filter((approval) => approval.riskLevel === "high");
  if (highRiskApprovals.length) alerts.push(`${highRiskApprovals.length} high-risk approval(s) need review or revoke guidance.`);
  const needsApproval = subscriptions.filter((subscription) => subscription.status === "needs_approval");
  if (needsApproval.length) alerts.push(`${needsApproval.length} recurring spend pattern(s) need user approval.`);
  return alerts;
}
