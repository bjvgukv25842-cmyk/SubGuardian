import { NextResponse } from "next/server";
import { sha256Hex } from "@/lib/crypto";
import { listMerchants, saveMerchant } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";
import { MerchantRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ merchants: await listMerchants({ ownerWallet: session.wallet }) });
}

export async function POST(request: Request) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const body = await request.json();
  const now = new Date().toISOString();
  const name = String(body.name || "New merchant").trim();
  const merchant: MerchantRecord = {
    id: `mch_${sha256Hex(`${session.wallet}:${name}:${now}`).slice(0, 16)}`,
    name,
    ownerWallet: session.wallet,
    agentId: body.agentId ? String(body.agentId).trim() : undefined,
    webhookUrl: body.webhookUrl ? String(body.webhookUrl).trim() : undefined,
    webhookSecret: body.webhookSecret ? String(body.webhookSecret).trim() : undefined,
    createdAt: now,
    updatedAt: now,
    status: "active"
  };
  await saveMerchant(merchant);
  return NextResponse.json(merchant);
}
