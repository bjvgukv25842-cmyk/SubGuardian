import { NextResponse } from "next/server";
import { StoredProfile } from "@/lib/types";
import { uploadEncryptedProfileToZeroG } from "@/lib/zeroG/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile: StoredProfile = {
      user: body.walletAddress || "0x0000000000000000000000000000000000000000",
      subscriptions: body.subscriptions || [],
      policy: body.policy,
      analysis: body.analysis || null,
      createdAt: new Date().toISOString(),
      project: "SubGuardian"
    };

    const result = await uploadEncryptedProfileToZeroG(profile);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload encrypted profile." },
      { status: 500 }
    );
  }
}
