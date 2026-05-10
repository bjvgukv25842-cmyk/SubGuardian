import { NextResponse } from "next/server";
import { getDecision } from "@/lib/serverStore";
import { getSessionFromCookies } from "@/lib/session";
import { validateIntegrationAuth } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const decision = await getDecision(decodeURIComponent(params.id));

  if (!decision) {
    return NextResponse.json({ error: "Decision not found." }, { status: 404 });
  }

  const session = await getSessionFromCookies();
  if (session && session.wallet.toLowerCase() === (decision.userWallet || decision.walletAddress || "").toLowerCase()) {
    return NextResponse.json(decision);
  }

  const auth = await validateIntegrationAuth(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.merchantId && decision.merchantId && auth.merchantId !== decision.merchantId) {
    return NextResponse.json({ error: "Decision belongs to another merchant." }, { status: 403 });
  }

  return NextResponse.json(decision);
}
