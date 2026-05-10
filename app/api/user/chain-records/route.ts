import { NextResponse } from "next/server";
import { analysisHashBytes32 } from "@/lib/crypto";
import { appendAuditLog, getDecision, saveChainRecord, updateDecision } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";
import { explorerTxUrl } from "@/lib/zeroG/chain";
import { ChainRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const body = await request.json();
  const decisionId = body.decisionId ? String(body.decisionId) : undefined;
  const decision = decisionId ? await getDecision(decisionId) : null;
  if (decision && (decision.userWallet || decision.walletAddress || "").toLowerCase() !== session.wallet.toLowerCase()) {
    return NextResponse.json({ error: "Decision does not belong to this wallet." }, { status: 403 });
  }
  const txHash = body.txHash ? String(body.txHash) : undefined;
  if (txHash && !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return NextResponse.json({ error: "txHash must be a valid EVM transaction hash." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const decisionHash = decision ? analysisHashBytes32({ decisionId: decision.decisionId, analysisHash: decision.analysisHash }) : undefined;
  const record: ChainRecord = {
    id: `chain_${Date.now()}`,
    userWallet: session.wallet,
    decisionId,
    policyHash: decision?.policyHash,
    decisionHash,
    storageRootHash: decision?.storageRootHash || body.storageRootHash,
    txHash: txHash as `0x${string}` | undefined,
    signerWallet: session.wallet,
    explorerUrl: txHash ? explorerTxUrl(txHash) : undefined,
    status: txHash ? "recorded" : "not_recorded",
    createdAt: now
  };
  await saveChainRecord(record);
  if (decision && txHash) {
    await updateDecision(decision.decisionId, {
      chainTxHash: txHash as `0x${string}`,
      chainRecorded: true,
      zeroGExplorerLink: explorerTxUrl(txHash)
    });
  }
  await appendAuditLog({
    id: `audit_chain_${Date.now()}`,
    userWallet: session.wallet,
    action: "chain.record",
    targetType: "chain_record",
    targetId: record.id,
    metadata: { decisionId, txHash, status: record.status },
    createdAt: now
  });
  return NextResponse.json(record);
}
