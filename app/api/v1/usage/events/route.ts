import { NextResponse } from "next/server";
import { validateIntegrationAuth } from "@/lib/apiAuth";
import { saveUsageEvent } from "@/lib/serverStore";
import { UsageEvent, UsageEventInput } from "@/lib/types";
import { sha256Hex } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await validateIntegrationAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as UsageEventInput;
    const timestamp = validIsoDate(body.timestamp) || new Date().toISOString();
    const createdAt = new Date().toISOString();
    const event: UsageEvent = {
      id: `usage_${sha256Hex({ ...body, timestamp, createdAt }).slice(0, 24)}`,
      agentId: String(body.agentId || auth.agentId || "unknown-agent").trim(),
      userWallet: String(body.userWallet || "").trim(),
      serviceName: String(body.serviceName || "").trim(),
      eventType: String(body.eventType || "unknown").trim(),
      units: positiveNumber(body.units, 0),
      cost: positiveNumber(body.cost, 0),
      timestamp,
      createdAt
    };

    if (!event.userWallet || !event.serviceName) {
      return NextResponse.json({ error: "userWallet and serviceName are required." }, { status: 400 });
    }

    await saveUsageEvent(event);
    return NextResponse.json({ ...event, merchantId: auth.merchantId, authWarning: auth.warning });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save usage event." },
      { status: 500 }
    );
  }
}

function positiveNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function validIsoDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}
