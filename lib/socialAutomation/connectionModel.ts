import type { PlatformConnection, PublishCapability, SocialPlatform } from "@/lib/socialAutomation/types";
import { resolveTokenHealth } from "@/lib/socialAutomation/tokenModel";

const PLATFORM_CONFIG: Record<SocialPlatform, { envs: string[]; scopes: string[]; restrictedByDefault?: boolean }> = {
  tiktok: { envs: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"], scopes: ["user.info.basic", "video.publish"], restrictedByDefault: true },
  instagram_reels: { envs: ["INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET"], scopes: ["instagram_business_content_publish", "instagram_business_basic"] },
  youtube_shorts: { envs: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"], scopes: ["youtube.upload", "youtube.readonly"] },
};

export function resolveCapability(connection: Omit<PlatformConnection, "publishCapability" | "capabilityReason" | "state">): {
  state: PlatformConnection["state"];
  publishCapability: PublishCapability;
  capabilityReason: string;
  authRequired: boolean;
} {
  if (!connection.authConfigured) {
    return { state: "degraded", publishCapability: "manual_only", capabilityReason: "oauth_not_configured", authRequired: true };
  }

  if (!connection.hasToken) {
    return { state: "auth_url_ready", publishCapability: "manual_only", capabilityReason: "auth_required", authRequired: true };
  }

  const token = resolveTokenHealth(connection as PlatformConnection);
  if (token.status === "expired") {
    return { state: "token_expired", publishCapability: "manual_only", capabilityReason: "token_expired", authRequired: true };
  }

  if (connection.auditRestricted) {
    return { state: "restricted", publishCapability: "restricted", capabilityReason: "platform_audit_restriction", authRequired: false };
  }

  if (connection.platform === "instagram_reels") {
    return { state: "connected", publishCapability: "private_only", capabilityReason: "instagram_publish_contract_only", authRequired: false };
  }

  return { state: "connected", publishCapability: "public_ready", capabilityReason: "oauth_token_valid", authRequired: false };
}

export function buildConnection(platform: SocialPlatform, input: Partial<PlatformConnection> = {}): PlatformConnection {
  const cfg = PLATFORM_CONFIG[platform];
  const authConfigured = cfg.envs.every((envName) => Boolean(process.env[envName]));
  const base = {
    platform,
    oauthProvider: "official_oauth" as const,
    scopes: cfg.scopes,
    scopeStatus: "ok" as const,
    tokenExpiresAt: null,
    refreshable: true,
    auditRestricted: Boolean(cfg.restrictedByDefault),
    connectedUser: null,
    lastSyncedAt: null,
    accountId: null,
    authConfigured,
    hasToken: false,
    authRequired: true,
    ...input,
  };

  const resolved = resolveCapability(base);
  return {
    ...base,
    state: resolved.state,
    publishCapability: resolved.publishCapability,
    capabilityReason: resolved.capabilityReason,
    authRequired: resolved.authRequired,
  };
}
