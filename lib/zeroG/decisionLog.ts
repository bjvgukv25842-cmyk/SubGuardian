import { uploadEncryptedProfileToZeroG } from "@/lib/zeroG/storage";

export function getAuthorizationMode(): "mock" | "external_llm" | "0g_live" {
  if (process.env.ENABLE_MOCK_COMPUTE !== "false" || !process.env.ZERO_G_COMPUTE_API_KEY) {
    return "mock";
  }

  return process.env.ZERO_G_COMPUTE_BASE_URL ? "0g_live" : "external_llm";
}

export async function persistDecisionSnapshotToZeroG(snapshot: unknown) {
  const result = await uploadEncryptedProfileToZeroG({
    user: "server-side-authorization",
    subscriptions: [],
    policy: snapshot as never,
    analysis: null,
    createdAt: new Date().toISOString(),
    project: "SubGuardian"
  });

  return result.storageRootHash;
}
