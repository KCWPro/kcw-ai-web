import crypto from "node:crypto";
import { getPublisher } from "@/lib/socialAutomation/publisherRegistry";
import type { OAuthStateRecord, SocialPlatform } from "@/lib/socialAutomation/types";

const oauthStates = new Map<string, OAuthStateRecord>();

function randomValue() {
  return crypto.randomBytes(16).toString("hex");
}

export function beginOAuth(platform: SocialPlatform, redirectUri: string) {
  const state = randomValue();
  const nonce = randomValue();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
  oauthStates.set(state, { platform, state, nonce, redirectUri, createdAt: createdAt.toISOString(), expiresAt: expiresAt.toISOString() });
  const authUrl = `${getPublisher(platform).buildOAuthUrl(state)}&nonce=${nonce}`;
  return { state, nonce, authUrl, expiresAt: expiresAt.toISOString() };
}

export function verifyOAuthState(state: string, platform: SocialPlatform) {
  const record = oauthStates.get(state);
  if (!record || record.platform !== platform) return { ok: false as const, reason: "invalid_state" };
  if (Date.now() > new Date(record.expiresAt).getTime()) return { ok: false as const, reason: "state_expired" };
  return { ok: true as const, record };
}

export function consumeOAuthState(state: string) {
  oauthStates.delete(state);
}
