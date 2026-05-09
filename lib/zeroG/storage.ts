import { encryptJson, sha256Hex } from "@/lib/crypto";
import { StorageUploadResult, StoredProfile } from "@/lib/types";

export async function uploadEncryptedProfileToZeroG(profile: StoredProfile): Promise<StorageUploadResult> {
  const encryptedPayload = encryptJson(profile);
  const mockMode = process.env.ENABLE_MOCK_STORAGE !== "false" || !process.env.ZERO_G_STORAGE_SERVER_PRIVATE_KEY;

  if (mockMode) {
    const storageRootHash = `0g-mock-${sha256Hex(encryptedPayload).slice(0, 48)}`;
    return {
      storageRootHash,
      encrypted: true,
      mockMode: true,
      payloadSize: encryptedPayload.ciphertext.length,
      encryption: {
        algorithm: encryptedPayload.algorithm,
        iv: encryptedPayload.iv,
        authTag: encryptedPayload.authTag
      }
    };
  }

  const storageRootHash = await uploadWithOfficialZeroGSdk(encryptedPayload);
  return {
    storageRootHash,
    encrypted: true,
    mockMode: false,
    payloadSize: encryptedPayload.ciphertext.length,
    encryption: {
      algorithm: encryptedPayload.algorithm,
      iv: encryptedPayload.iv,
      authTag: encryptedPayload.authTag
    }
  };
}

async function uploadWithOfficialZeroGSdk(encryptedPayload: ReturnType<typeof encryptJson>): Promise<string> {
  const rpc = process.env.ZERO_G_STORAGE_RPC;
  const indexer = process.env.ZERO_G_STORAGE_INDEXER;
  const privateKey = process.env.ZERO_G_STORAGE_SERVER_PRIVATE_KEY;
  const expectedReplica = Number(process.env.ZERO_G_STORAGE_EXPECTED_REPLICA || 1);
  const taskSize = Number(process.env.ZERO_G_STORAGE_TASK_SIZE || 10);
  const fee = BigInt(process.env.ZERO_G_STORAGE_FEE || 0);

  if (!rpc || !indexer || !privateKey) {
    throw new Error(
      "ZERO_G_STORAGE_RPC, ZERO_G_STORAGE_INDEXER and ZERO_G_STORAGE_SERVER_PRIVATE_KEY are required for live server-paid 0G Storage mode. Do not use a user's MetaMask private key here; keep ENABLE_MOCK_STORAGE=true on Vercel unless you have a dedicated server signer."
    );
  }

  try {
    const { Indexer, MemData } = await import("@0glabs/0g-ts-sdk");
    const { JsonRpcProvider, Wallet, toUtf8Bytes } = await import("ethers");
    const payload = Buffer.from(JSON.stringify(encryptedPayload));

    const provider = new JsonRpcProvider(rpc);
    const signer = new Wallet(privateKey, provider);
    const file = new MemData(payload);
    const client = new Indexer(indexer);
    const uploadSigner = signer as unknown as Parameters<typeof client.upload>[2];
    const [result, err] = await client.upload(
      file,
      rpc,
      uploadSigner,
      {
        tags: toUtf8Bytes("SubGuardian encrypted profile"),
        finalityRequired: true,
        taskSize,
        expectedReplica,
        skipTx: false,
        fee
      }
    );

    if (err) {
      throw err;
    }

    if (result.rootHash) {
      return result.rootHash;
    }
  } catch (error) {
    throw new Error(`0G Storage SDK upload failed: ${String(error)}`);
  }

  throw new Error("0G Storage SDK upload did not return a root hash.");
}
