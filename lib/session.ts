import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "crypto";
import { verifyMessage } from "ethers";
import { sha256Hex } from "@/lib/crypto";
import { consumeAuthNonce, deleteSession, getAuthNonce, getSession, saveAuthNonce, saveSession, upsertUser } from "@/lib/serverStore";
import { WalletSession } from "@/lib/types";

export const sessionCookieName = "subguardian_session";
const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const nonceTtlMs = 10 * 60 * 1000;

export function normalizeWalletAddress(wallet: string) {
  return String(wallet || "").trim().toLowerCase();
}

export function createLoginMessage(wallet: string, nonce: string, origin = "SubGuardian") {
  const issuedAt = new Date().toISOString();
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
  const nonce = randomBytes(16).toString("hex");
  const { issuedAt, message } = createLoginMessage(wallet, nonce, origin);
  const expiresAt = new Date(Date.now() + nonceTtlMs).toISOString();
  await saveAuthNonce({
    nonce,
    wallet,
    message,
    issuedAt,
    expiresAt,
    used: false
  });
  return { nonce, message, expiresAt };
}

export async function verifyWalletLogin(input: { wallet: string; nonce: string; message: string; signature: string; userAgent?: string }) {
  const recovered = verifyMessage(input.message, input.signature);
  if (normalizeWalletAddress(recovered) !== normalizeWalletAddress(input.wallet)) {
    throw new Error("Signature does not match the requested wallet.");
  }

  const nonce = await getAuthNonce(input.nonce, input.wallet);
  if (!nonce) {
    throw new Error("Login nonce is invalid, expired, or already used.");
  }

  if (!safeEqual(nonce.message, input.message)) {
    throw new Error("Signed message does not match the issued login challenge.");
  }

  const consumedNonce = await consumeAuthNonce(input.nonce, input.wallet);
  if (!consumedNonce) {
    throw new Error("Login nonce is invalid, expired, or already used.");
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
  const sessionId = cookies().get(sessionCookieName)?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export async function requireUserSession() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Connect wallet and sign in first." }, { status: 401 });
  }
  return session;
}

export function setSessionCookie(response: NextResponse, session: WalletSession) {
  response.cookies.set(sessionCookieName, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt)
  });
}

export async function clearSessionCookie(response: NextResponse) {
  const sessionId = cookies().get(sessionCookieName)?.value;
  if (sessionId) await deleteSession(sessionId);
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
