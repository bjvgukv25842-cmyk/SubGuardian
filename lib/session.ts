import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { verifyMessage } from "ethers";
import { sha256Hex } from "@/lib/crypto";
import { deleteSession, getSession, saveSession, upsertUser } from "@/lib/serverStore";
import { WalletSession } from "@/lib/types";

export const sessionCookieName = "subguardian_session";
const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const nonceTtlMs = 10 * 60 * 1000;
const tokenVersion = "sg1";

export function normalizeWalletAddress(wallet: string) {
  return String(wallet || "").trim().toLowerCase();
}

export function createLoginMessage(wallet: string, nonce: string, origin = "SubGuardian", issuedAt = new Date().toISOString()) {
  return {
    issuedAt,
    message: [
      `${origin} wants you to sign in with your Ethereum wallet:`,
      wallet,
      "",
      "This signature creates a SubGuardian session. It does not grant asset custody or transaction permission.",
      "",
      `URI: ${origin}`,
      "Version: 1",
      `Chain ID: ${process.env.NEXT_PUBLIC_0G_CHAIN_ID || 16661}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`
    ].join("\n")
  };
}

export async function createAuthChallenge(wallet: string, origin?: string) {
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + nonceTtlMs).toISOString();
  const nonce = signToken({
    type: "login_nonce",
    wallet: normalizeWalletAddress(wallet),
    random: randomBytes(16).toString("hex"),
    issuedAt,
    expiresAt
  });
  const { message } = createLoginMessage(wallet, nonce, origin, issuedAt);
  return { nonce, message, expiresAt };
}

export async function verifyWalletLogin(input: { wallet: string; nonce: string; message: string; signature: string; userAgent?: string }) {
  const challenge = verifyToken(input.nonce);
  if (!challenge || challenge.type !== "login_nonce") {
    throw new Error("Login nonce is invalid, expired, or already used.");
  }
  if (normalizeWalletAddress(String(challenge.wallet || "")) !== normalizeWalletAddress(input.wallet)) {
    throw new Error("Login nonce is invalid for this wallet.");
  }
  if (!challenge.expiresAt || Date.parse(String(challenge.expiresAt)) < Date.now()) {
    throw new Error("Login nonce is expired. Please sign in again.");
  }
  if (!input.message.includes(`Nonce: ${input.nonce}`) || !input.message.includes(input.wallet)) {
    throw new Error("Signed message does not match the issued login challenge.");
  }

  const recovered = verifyMessage(input.message, input.signature);
  if (normalizeWalletAddress(recovered) !== normalizeWalletAddress(input.wallet)) {
    throw new Error("Signature does not match the requested wallet.");
  }

  await upsertUser(input.wallet);
  const now = new Date();
  const session: WalletSession = {
    id: `sess_${sha256Hex(`${input.wallet}:${input.signature}:${now.toISOString()}`).slice(0, 32)}`,
    wallet: input.wallet,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + sessionTtlMs).toISOString(),
    userAgent: input.userAgent
  };
  await saveSession(session);
  return session;
}

export async function getSessionFromCookies() {
  const sessionCookie = cookies().get(sessionCookieName)?.value;
  if (!sessionCookie) return null;

  if (sessionCookie.startsWith(`${tokenVersion}.`)) {
    const payload = verifyToken(sessionCookie);
    if (!payload || payload.type !== "wallet_session") return null;
    if (!payload.expiresAt || Date.parse(String(payload.expiresAt)) < Date.now()) return null;
    return {
      id: String(payload.id || ""),
      wallet: String(payload.wallet || ""),
      createdAt: String(payload.createdAt || ""),
      expiresAt: String(payload.expiresAt || ""),
      userAgent: payload.userAgent ? String(payload.userAgent) : undefined
    } satisfies WalletSession;
  }

  return getSession(sessionCookie);
}

export async function requireUserSession() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Connect wallet and sign in first." }, { status: 401 });
  }
  return session;
}

export function setSessionCookie(response: NextResponse, session: WalletSession) {
  response.cookies.set(sessionCookieName, signToken({ type: "wallet_session", ...session }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt)
  });
}

export async function clearSessionCookie(response: NextResponse) {
  const sessionId = cookies().get(sessionCookieName)?.value;
  if (sessionId && !sessionId.startsWith(`${tokenVersion}.`)) await deleteSession(sessionId);
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export function currentOrigin() {
  const h = headers();
  return h.get("origin") || h.get("host") || "SubGuardian";
}

export function assertSessionWallet(sessionWallet: string, requestedWallet?: string) {
  if (!requestedWallet) return true;
  return normalizeWalletAddress(sessionWallet) === normalizeWalletAddress(requestedWallet);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signToken(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${tokenVersion}.${body}.${hmac(body)}`;
}

function verifyToken(token: string): Record<string, unknown> | null {
  const [version, body, signature] = String(token || "").split(".");
  if (version !== tokenVersion || !body || !signature || !safeEqual(signature, hmac(body))) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hmac(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function sessionSecret() {
  return process.env.SUBGUARDIAN_SESSION_SECRET || process.env.SUBGUARDIAN_ENCRYPTION_SECRET || "subguardian-local-demo-session-secret";
}
