import { resolveTokenHealth } from "@/lib/socialAutomation/tokenModel";
import type { PlatformConnection, PublishCapability, SocialPlatform } from "@/lib/socialAutomation/types";

type PlatformOAuthConfig = {
  platform: SocialPlatform;
  envKeys: string[];
  scopes: string[];
  auditRestricted: boolean;
};

const oauthConfig: PlatformOAuthConfig[] = [
  { platform: "tiktok", envKeys: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET", "SOCIAL_AUTOMATION_OAUTH_REDIRECT_BASE_URL"], scopes: ["user.info.basic", "video.publish"], auditRestricted: true },
  { platform: "instagram_reels", envKeys: ["INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET", "SOCIAL_AUTOMATION_OAUTH_REDIRECT_BASE_URL"], scopes: ["instagram_business_content_publish", "instagram_business_basic"], auditRestricted: false },
  { platform: "youtube_shorts", envKeys: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "SOCIAL_AUTOMATION_OAUTH_REDIRECT_BASE_URL"], scopes: ["youtube.upload", "youtube.readonly"], auditRestricted: false },
];

function hasOAuthEnv(keys: string[]): boolean {
  return keys.every((key) => Boolean(process.env[key]));
}

function getCapability(platform: SocialPlatform, state: PlatformConnection["state"], oauthConfigured: boolean, auditRestricted: boolean): { capability: PublishCapability; reason: string } {
  if (!oauthConfigured) return { capability: "manual_only", reason: "not configured" };
  if (state === "not_connected" || state === "auth_url_ready") return { capability: "manual_only", reason: "auth required" };
  if (state === "token_expired") return { capability: "draft_only", reason: "token expired; re-auth required" };
  if (state === "restricted" || auditRestricted) return { capability: platform === "tiktok" ? "private_only" : "restricted", reason: "platform restriction or audit gate" };
  if (state === "degraded") return { capability: "draft_only", reason: "degraded fallback active" };
  return { capability: "public_ready", reason: "oauth connected + token valid" };
}

export function buildDefaultConnections(now = new Date()): PlatformConnection[] {
  return oauthConfig.map((cfg) => {
    const oauthConfigured = hasOAuthEnv(cfg.envKeys);
    const state: PlatformConnection["state"] = oauthConfigured ? "auth_url_ready" : "not_connected";
    const capabilityInfo = getCapability(cfg.platform, state, oauthConfigured, cfg.auditRestricted);
    return {
      platform: cfg.platform,
      state,
      oauthProvider: "official_oauth",
      scopes: cfg.scopes,
      scopeStatus: oauthConfigured ? "ok" : "missing",
      oauthConfigured,
      authUrlReady: oauthConfigured,
      authRequired: true,
      tokenExpiresAt: null,
      refreshable: oauthConfigured,
      auditRestricted: cfg.auditRestricted,
      connectedUser: null,
      lastSyncedAt: oauthConfigured ? now.toISOString() : null,
      accountId: null,
      capability: capabilityInfo.capability,
      capabilityReason: capabilityInfo.reason,
    };
  });
}

export function deriveConnectionState(connection: PlatformConnection): PlatformConnection {
  const tokenHealth = resolveTokenHealth(connection);
  let state = connection.state;
  if (!connection.oauthConfigured) state = "not_connected";
  else if (!connection.accountId) state = "auth_url_ready";
  else if (tokenHealth.status === "expired") state = "token_expired";
  else if (connection.auditRestricted) state = "restricted";
  else state = "connected";

  const capabilityInfo = getCapability(connection.platform, state, connection.oauthConfigured, connection.auditRestricted);
  return { ...connection, state, authRequired: state !== "connected", capability: capabilityInfo.capability, capabilityReason: capabilityInfo.reason };
}
