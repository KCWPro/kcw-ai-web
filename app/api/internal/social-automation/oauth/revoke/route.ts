import { deriveConnectionState } from "@/lib/socialAutomation/connectionModel";
import { inMemoryConnectionPersistence } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

const platforms: SocialPlatform[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { platform?: SocialPlatform };
  if (!body.platform || !platforms.includes(body.platform)) {
    return Response.json({ success: false, error: "invalid_platform" }, { status: 400 });
  }

  const updated = inMemoryConnectionPersistence.upsertConnection(body.platform, {
    accountId: null,
    connectedUser: null,
    tokenExpiresAt: null,
    lastSyncedAt: new Date().toISOString(),
  });
  if (!updated) return Response.json({ success: false, error: "connection_not_found" }, { status: 404 });

  return Response.json({ success: true, connection: deriveConnectionState(updated), note: "Revoke contract scaffold complete; wire provider-side token revocation endpoint." });
}
