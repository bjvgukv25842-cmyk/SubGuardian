import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, wallet: session.wallet, expiresAt: session.expiresAt });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  await clearSessionCookie(response);
  return response;
}
