import { createCipheriv, createHash, randomBytes } from "crypto";
import { stableJson } from "./stableJson";

const algorithm = "aes-256-gcm";

export function sha256Hex(value: unknown): string {
  return createHash("sha256").update(typeof value === "string" ? value : stableJson(value)).digest("hex");
}

export function analysisHashBytes32(value: unknown): `0x${string}` {
  return `0x${sha256Hex(value)}` as `0x${string}`;
}

export function encryptJson(value: unknown, secret?: string) {
  const plaintext = new TextEncoder().encode(stableJson(value));
  const keyMaterial = secret || process.env.SUBGUARDIAN_ENCRYPTION_SECRET || "subguardian-local-demo-secret";
  const key = createHash("sha256").update(keyMaterial).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, new Uint8Array(key), new Uint8Array(iv));
  const encrypted = cipher.update(plaintext);
  const final = cipher.final();
  const ciphertext = Buffer.concat([new Uint8Array(encrypted), new Uint8Array(final)]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    algorithm: "AES-256-GCM" as const
  };
}
