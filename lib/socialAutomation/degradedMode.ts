import type { DegradedState, PlatformConnection, PublishQueueItem } from "@/lib/socialAutomation/types";
import { resolveTokenHealth } from "@/lib/socialAutomation/tokenModel";

export function buildDegradedState(connections: PlatformConnection[], queue: PublishQueueItem[]): DegradedState {
  const platformNotConnected = connections.filter((item) => item.state === "not_connected" || item.state === "auth_url_ready" || item.state === "degraded").map((item) => item.platform);
  const tokenExpired = connections.filter((item) => item.state === "token_expired" || resolveTokenHealth(item).status === "expired").map((item) => item.platform);
  const auditRestricted = connections.filter((item) => item.auditRestricted || item.state === "restricted").map((item) => item.platform);
  const publishDowngraded = queue.filter((item) => item.status === "downgraded" || item.payload.visibility === "draft" || item.payload.visibility === "private").map((item) => item.platform);

  return {
    platformNotConnected,
    tokenExpired,
    auditRestricted,
    publishDowngraded,
    analyticsUnavailable: [...new Set([...platformNotConnected, ...tokenExpired])],
  };
}
