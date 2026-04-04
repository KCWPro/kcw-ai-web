import { randomUUID } from "node:crypto";
import type { PlatformConnection, SocialPlatform } from "@/lib/socialAutomation/types";

type OAuthSession = {
  id: string;
  platform: SocialPlatform;
  state: string;
  nonce: string;
  createdAt: number;
};

const oauthSessionStore = new Map<string, OAuthSession>();

export function createOAuthState(platform: SocialPlatform): OAuthSession {
  const id = randomUUID();
  const state = randomUUID();
  const nonce = randomUUID();
  const session = { id, platform, state, nonce, createdAt: Date.now() };
  oauthSessionStore.set(state, session);
  return session;
}

export function consumeOAuthState(state: string, platform: SocialPlatform): OAuthSession | null {
  const session = oauthSessionStore.get(state);
  if (!session || session.platform !== platform) return null;
  oauthSessionStore.delete(state);
  if (Date.now() - session.createdAt > 15 * 60_000) return null;
  return session;
}

export type ConnectionPersistence = {
  upsertConnection(platform: SocialPlatform, next: Partial<PlatformConnection>): PlatformConnection | null;
};
