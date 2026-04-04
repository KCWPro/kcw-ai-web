import { readSocialAutomationState, savePlatformConnection } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function POST(_req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (!platforms.includes(platform as SocialPlatform)) {
    return Response.json({ success: false, error: "unsupported_platform" }, { status: 400 });
  }

  const snapshot = readSocialAutomationState();
  const connection = snapshot.connections.find((item) => item.platform === platform)!;
  if (!connection.hasToken || !connection.refreshable) {
    return Response.json({ success: false, error: "token_not_refreshable" }, { status: 400 });
  }

  const next = savePlatformConnection(platform as SocialPlatform, { tokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() });
  return Response.json({ success: true, platform, connection: next.connections.find((item) => item.platform === platform), contract: "refresh_contract_only" });
}
