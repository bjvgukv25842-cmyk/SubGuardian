import { NextResponse } from "next/server";
import { createAuthChallenge, currentOrigin } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wallet = String(body.wallet || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: "A valid EVM wallet address is required." }, { status: 400 });
    }
    const challenge = await createAuthChallenge(wallet, currentOrigin());
    return NextResponse.json(challenge);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create login challenge." }, { status: 500 });
  }
}
