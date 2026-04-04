import { savePlatformConnection } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function POST(_req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (!platforms.includes(platform as SocialPlatform)) {
    return Response.json({ success: false, error: "unsupported_platform" }, { status: 400 });
  }

  const next = savePlatformConnection(platform as SocialPlatform, {
    hasToken: false,
    tokenExpiresAt: null,
    connectedUser: null,
    accountId: null,
  });
  return Response.json({ success: true, platform, connection: next.connections.find((item) => item.platform === platform), contract: "revoke_contract_only" });
}
