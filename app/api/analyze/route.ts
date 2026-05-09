import { NextResponse } from "next/server";
import { analyzeWithZeroGCompute } from "@/lib/zeroG/compute";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const analysis = await analyzeWithZeroGCompute({
      subscriptions: body.subscriptions || [],
      policy: body.policy,
      walletAddress: body.walletAddress
    });

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze subscriptions." },
      { status: 500 }
    );
  }
}
