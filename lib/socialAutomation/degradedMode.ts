import type { DegradedState, PlatformConnection, PublishQueueItem } from "@/lib/socialAutomation/types";
import { resolveTokenHealth } from "@/lib/socialAutomation/tokenModel";

export function buildDegradedState(connections: PlatformConnection[], queue: PublishQueueItem[]): DegradedState {
  const platformNotConnected = connections.filter((item) => item.state === "not_connected").map((item) => item.platform);
  const tokenExpired = connections.filter((item) => resolveTokenHealth(item).status === "expired").map((item) => item.platform);
  const auditRestricted = connections.filter((item) => item.auditRestricted).map((item) => item.platform);
  const publishDowngraded = queue.filter((item) => item.payload.visibility === "draft" || item.payload.visibility === "private").map((item) => item.platform);

  return {
    platformNotConnected,
    tokenExpired,
    auditRestricted,
    publishDowngraded,
    analyticsUnavailable: [...platformNotConnected, ...tokenExpired],
  };
}
