import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sha256Hex } from "./crypto";
import { findMerchantApiKeyByHash, getMerchant, touchMerchantApiKey } from "./serverStore";
import { IntegrationAuthContext } from "./types";

export function isApiAuthConfigured() {
  return Boolean(process.env.SUBGUARDIAN_API_KEY);
}

export function validateApiKey(request: Request) {
  const expected = process.env.SUBGUARDIAN_API_KEY;

  if (!expected) {
    return process.env.NODE_ENV === "production"
      ? {
          warning:
            "SUBGUARDIAN_API_KEY is not configured. Production deployments should require Authorization: Bearer <SUBGUARDIAN_API_KEY>."
        }
      : null;
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (token && token === expected) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized. Provide Authorization: Bearer <SUBGUARDIAN_API_KEY>." }, { status: 401 });
}

export async function validateIntegrationAuth(request: Request): Promise<IntegrationAuthContext | NextResponse> {
  const expected = process.env.SUBGUARDIAN_API_KEY;
  const demoExpected = process.env.SUBGUARDIAN_DEMO_API_KEY;
  const token = bearerToken(request);
  const isDeveloperDemoRequest = request.headers.get("x-subguardian-demo") === "developers-page";

  if (expected && token && token === expected) {
    return { ok: true, authType: "global_api_key" };
  }

  if (demoExpected && token && token === demoExpected) {
    return { ok: true, authType: "global_api_key" };
  }

  if (isDeveloperDemoRequest && token === "sg_demo_local") {
    return {
      ok: true,
      authType: "dev_unconfigured",
      warning: "Developer Demo request accepted with the built-in demo token. Production integrations should use merchant API keys."
    };
  }

  if (token) {
    const key = await findMerchantApiKeyByHash(hashApiKey(token));
    if (key) {
      const merchant = await getMerchant(key.merchantId);
      if (!merchant || merchant.status !== "active") {
        return NextResponse.json({ error: "Merchant is not active." }, { status: 401 });
      }
      await touchMerchantApiKey(key.id);
      return {
        ok: true,
        authType: "merchant_api_key",
        merchantId: key.merchantId,
        agentId: merchant.agentId
      };
    }
  }

  if (!expected && process.env.NODE_ENV !== "production") {
    return {
      ok: true,
      authType: "dev_unconfigured",
      warning: "SUBGUARDIAN_API_KEY is not configured. Local development accepted this request without a production API key."
    };
  }

  return NextResponse.json({ error: "Unauthorized. Provide a merchant API key or SUBGUARDIAN_API_KEY bearer token." }, { status: 401 });
}

export function hashApiKey(apiKey: string) {
  return sha256Hex(`subguardian-api-key:${apiKey}`);
}

export function generateApiKey() {
  return `sg_live_${randomBytes(24).toString("hex")}`;
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.replace(/^Bearer\s+/i, "").trim();
}
