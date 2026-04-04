import { deriveConnectionState } from "@/lib/socialAutomation/connectionModel";
import { consumeOAuthState } from "@/lib/socialAutomation/oauthPersistence";
import { inMemoryConnectionPersistence, readSocialAutomationState, writeSocialAutomationState } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") as SocialPlatform | null;
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!platform || !platforms.includes(platform) || !state || !code) {
    return Response.json({ success: false, error: "invalid_callback_parameters" }, { status: 400 });
  }

  const session = consumeOAuthState(state, platform);
  if (!session) {
    return Response.json({ success: false, error: "state_validation_failed" }, { status: 400 });
  }

  const tokenExpiresAt = new Date(Date.now() + 55 * 60_000).toISOString();
  const updated = inMemoryConnectionPersistence.upsertConnection(platform, {
    accountId: `${platform}_acct_demo`,
    connectedUser: `authorized_${platform}`,
    tokenExpiresAt,
    refreshable: true,
    lastSyncedAt: new Date().toISOString(),
  });

  if (!updated) {
    return Response.json({ success: false, error: "connection_not_found" }, { status: 404 });
  }

  const snapshot = readSocialAutomationState();
  const connections = snapshot.connections.map((item) => (item.platform === platform ? deriveConnectionState(item) : item));
  writeSocialAutomationState({ ...snapshot, connections });

  return Response.json({ success: true, platform, state: "connected", tokenExpiresAt, note: "OAuth callback scaffold complete; replace demo token exchange with official API call." });
}
