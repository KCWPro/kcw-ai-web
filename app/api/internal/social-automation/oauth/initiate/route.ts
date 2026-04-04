import { getPublisher } from "@/lib/socialAutomation/publisherRegistry";
import { createOAuthState } from "@/lib/socialAutomation/oauthPersistence";
import { readSocialAutomationState } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { platform?: SocialPlatform };
  if (!body.platform || !platforms.includes(body.platform)) {
    return Response.json({ success: false, error: "invalid_platform" }, { status: 400 });
  }

  const snapshot = readSocialAutomationState();
  const connection = snapshot.connections.find((item) => item.platform === body.platform);
  if (!connection?.oauthConfigured) {
    return Response.json({ success: false, error: "oauth_not_configured", state: "not_connected" }, { status: 400 });
  }

  const oauthSession = createOAuthState(body.platform);
  const authUrl = getPublisher(body.platform).buildOAuthUrl(oauthSession.state);
  return Response.json({ success: true, platform: body.platform, state: oauthSession.state, nonce: oauthSession.nonce, authUrl });
}
