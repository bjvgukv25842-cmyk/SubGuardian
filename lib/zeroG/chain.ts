import { defineChain } from "viem";

export const zeroGChainId = Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID || 16661);
export const zeroGRpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc.0g.ai";
export const zeroGExplorerUrl = process.env.NEXT_PUBLIC_0G_EXPLORER_URL || "https://chainscan.0g.ai";
export const subscriptionRegistryAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xaC87E72e1aF91174EedaC91C08bF56768d6cE9fD";

export const zeroGMainnet = defineChain({
  id: zeroGChainId,
  name: "0G Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G"
  },
  rpcUrls: {
    default: {
      http: [zeroGRpcUrl]
    }
  },
  blockExplorers: {
    default: {
      name: "0G Chainscan",
      url: zeroGExplorerUrl
    }
  }
});

export const subscriptionPolicyRegistryAbi = [
  {
    type: "event",
    name: "SubscriptionAdded",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "subId", type: "uint256", indexed: true },
      { name: "serviceName", type: "string", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "AnalysisRecorded",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "subId", type: "uint256", indexed: true },
      { name: "analysisHash", type: "bytes32", indexed: false },
      { name: "storageRootHash", type: "string", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "RenewalDecisionRecorded",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "subId", type: "uint256", indexed: true },
      { name: "decision", type: "uint8", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "function",
    name: "addSubscription",
    stateMutability: "nonpayable",
    inputs: [
      { name: "serviceName", type: "string" },
      { name: "category", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "currency", type: "string" },
      { name: "billingCycle", type: "string" },
      { name: "nextRenewalDate", type: "uint256" },
      { name: "storageRootHash", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "recordAnalysis",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subId", type: "uint256" },
      { name: "analysisHash", type: "bytes32" },
      { name: "storageRootHash", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "recordDecision",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subId", type: "uint256" },
      { name: "decision", type: "uint8" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updatePolicyStorage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "subId", type: "uint256" },
      { name: "storageRootHash", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getUserSubscriptions",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }]
  }
] as const;

export function explorerTxUrl(txHash: string) {
  if (!txHash) {
    return "";
  }
  return `${zeroGExplorerUrl.replace(/\/$/, "")}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string) {
  if (!address) {
    return "";
  }
  return `${zeroGExplorerUrl.replace(/\/$/, "")}/address/${address}`;
}
