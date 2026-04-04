import { consumeOAuthState, verifyOAuthState } from "@/lib/socialAutomation/oauth";
import { savePlatformConnection } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (!platforms.includes(platform as SocialPlatform)) {
    return Response.json({ success: false, error: "unsupported_platform" }, { status: 400 });
  }

  const url = new URL(req.url);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code");
  if (!code) {
    return Response.json({ success: false, error: "missing_code" }, { status: 400 });
  }

  const verified = verifyOAuthState(state, platform as SocialPlatform);
  if (!verified.ok) {
    return Response.json({ success: false, error: verified.reason }, { status: 400 });
  }

  consumeOAuthState(state);
  const next = savePlatformConnection(platform as SocialPlatform, {
    hasToken: true,
    tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    connectedUser: `${platform}_authorized_user`,
    accountId: `${platform}_account`,
  });

  return Response.json({ success: true, platform, connection: next.connections.find((item) => item.platform === platform), note: "Callback scaffold stores a demo token marker only." });
}
