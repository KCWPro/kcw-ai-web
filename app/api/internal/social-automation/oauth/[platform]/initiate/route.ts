import { beginOAuth } from "@/lib/socialAutomation/oauth";
import { readSocialAutomationState } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function POST(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (!platforms.includes(platform as SocialPlatform)) {
    return Response.json({ success: false, error: "unsupported_platform" }, { status: 400 });
  }

  const snapshot = readSocialAutomationState();
  const connection = snapshot.connections.find((item) => item.platform === platform)!;
  if (!connection.authConfigured) {
    return Response.json({ success: false, error: "oauth_not_configured", state: connection.state }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { redirectUri?: string };
  const redirectUri = body.redirectUri ?? "http://localhost:3000/internal/social-automation";
  const result = beginOAuth(platform as SocialPlatform, redirectUri);
  return Response.json({ success: true, platform, ...result, contract: "official_oauth_only" });
}
