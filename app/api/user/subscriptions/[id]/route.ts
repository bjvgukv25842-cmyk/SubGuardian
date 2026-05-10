import { NextResponse } from "next/server";
import { appendAuditLog, updateSubscriptionStatus } from "@/lib/serverStore";
import { requireUserSession } from "@/lib/session";
import { SubscriptionStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireUserSession();
  if (session instanceof NextResponse) return session;
  const body = await request.json();
  const status = body.status as SubscriptionStatus;
  if (!["trusted", "paused", "blocked", "needs_approval"].includes(status)) {
    return NextResponse.json({ error: "Invalid subscription status." }, { status: 400 });
  }
  const subscription = await updateSubscriptionStatus(session.wallet, decodeURIComponent(params.id), status);
  if (!subscription) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  await appendAuditLog({
    id: `audit_subscription_${Date.now()}`,
    userWallet: session.wallet,
    action: "subscription.status.update",
    targetType: "subscription",
    targetId: subscription.id,
    metadata: { status },
    createdAt: new Date().toISOString()
  });
  return NextResponse.json(subscription);
}
