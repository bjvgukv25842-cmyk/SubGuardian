import { NextResponse } from "next/server";
import { HealthResponse } from "@/lib/types";
import { subscriptionRegistryAddress, zeroGChainId, zeroGExplorerUrl, zeroGRpcUrl } from "@/lib/zeroG/chain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const response: HealthResponse = {
    app: process.env.NEXT_PUBLIC_APP_NAME || "SubGuardian",
    mockMode: {
      compute: process.env.ENABLE_MOCK_COMPUTE !== "false" || !Boolean(process.env.ZERO_G_COMPUTE_API_KEY),
      storage: process.env.ENABLE_MOCK_STORAGE !== "false" || !Boolean(process.env.ZERO_G_STORAGE_SERVER_PRIVATE_KEY)
    },
    config: {
      hasComputeBaseUrl: Boolean(process.env.ZERO_G_COMPUTE_BASE_URL),
      hasComputeApiKey: Boolean(process.env.ZERO_G_COMPUTE_API_KEY),
      hasStorageRpc: Boolean(process.env.ZERO_G_STORAGE_RPC),
      hasStorageIndexer: Boolean(process.env.ZERO_G_STORAGE_INDEXER),
      hasStorageServerSigner: Boolean(process.env.ZERO_G_STORAGE_SERVER_PRIVATE_KEY),
      hasContractAddress: Boolean(subscriptionRegistryAddress)
    },
    chain: {
      chainId: zeroGChainId,
      rpcUrl: zeroGRpcUrl,
      explorerUrl: zeroGExplorerUrl,
      contractAddress: subscriptionRegistryAddress
    }
  };

  return NextResponse.json(response);
}
