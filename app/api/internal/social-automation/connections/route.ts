import { resolveCapability } from "@/lib/socialAutomation/connectionModel";
import { savePlatformConnection, readSocialAutomationState } from "@/lib/socialAutomation/store";
import type { SocialPlatform } from "@/lib/socialAutomation/types";

export async function GET() {
  const snapshot = readSocialAutomationState();
  return Response.json({ success: true, connections: snapshot.connections, degraded: snapshot.degraded });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { platform?: SocialPlatform; hasToken?: boolean; tokenExpiresAt?: string | null; connectedUser?: string | null; accountId?: string | null; auditRestricted?: boolean };
  if (!body.platform) {
    return Response.json({ success: false, error: "platform_required" }, { status: 400 });
  }

  const current = readSocialAutomationState();
  const existing = current.connections.find((item) => item.platform === body.platform);
  if (!existing) {
    return Response.json({ success: false, error: "unknown_platform" }, { status: 404 });
  }

  const merged = { ...existing, ...body };
  const resolved = resolveCapability(merged);
  const next = savePlatformConnection(body.platform, {
    ...body,
    state: resolved.state,
    publishCapability: resolved.publishCapability,
    capabilityReason: resolved.capabilityReason,
    authRequired: resolved.authRequired,
  });

  return Response.json({ success: true, connections: next.connections, degraded: next.degraded });
}
