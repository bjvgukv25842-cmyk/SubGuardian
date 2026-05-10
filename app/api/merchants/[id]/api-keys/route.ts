import { NextResponse } from "next/server";
import { generateApiKey, hashApiKey } from "@/lib/apiAuth";
import { getMerchant, listMerchantApiKeys, saveMerchantApiKey } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";
import { MerchantApiKey } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const merchant = await getMerchant(params.id);
  if (!merchant || merchant.ownerWallet?.toLowerCase() !== session.wallet.toLowerCase()) {
    return NextResponse.json({ error: "Merchant not found for this wallet." }, { status: 404 });
  }
  const keys = await listMerchantApiKeys(params.id);
  return NextResponse.json({
    apiKeys: keys.map((key) => ({ id: key.id, label: key.label, createdAt: key.createdAt, revokedAt: key.revokedAt, lastUsedAt: key.lastUsedAt }))
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const merchant = await getMerchant(params.id);
  if (!merchant || merchant.ownerWallet?.toLowerCase() !== session.wallet.toLowerCase()) {
    return NextResponse.json({ error: "Merchant not found for this wallet." }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const rawKey = generateApiKey();
  const now = new Date().toISOString();
  const apiKey: MerchantApiKey = {
    id: `key_${rawKey.slice(-16)}`,
    merchantId: params.id,
    keyHash: hashApiKey(rawKey),
    label: String(body.label || "Default API key"),
    createdAt: now
  };
  await saveMerchantApiKey(apiKey);
  return NextResponse.json({
    id: apiKey.id,
    merchantId: params.id,
    apiKey: rawKey,
    createdAt: now,
    warning: "Store this API key now. SubGuardian only stores a hash."
  });
}
