import { NextResponse } from "next/server";
import { setSessionCookie, verifyWalletLogin } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await verifyWalletLogin({
      wallet: String(body.wallet || ""),
      nonce: String(body.nonce || ""),
      message: String(body.message || ""),
      signature: String(body.signature || ""),
      userAgent: request.headers.get("user-agent") || undefined
    });
    const response = NextResponse.json({ wallet: session.wallet, expiresAt: session.expiresAt });
    setSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to verify wallet login." }, { status: 401 });
  }
}
