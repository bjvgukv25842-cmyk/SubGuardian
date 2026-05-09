import { stableJson } from "@/lib/stableJson";

export async function analysisHashBytes32Browser(value: unknown): Promise<`0x${string}`> {
  const encoded = new TextEncoder().encode(stableJson(value));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hash}`;
}
