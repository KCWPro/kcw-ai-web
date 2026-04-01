import type { PlatformConnection, TokenHealth } from "@/lib/socialAutomation/types";

export function resolveTokenHealth(connection: PlatformConnection, now = new Date()): TokenHealth {
  if (!connection.tokenExpiresAt) {
    return { platform: connection.platform, status: "missing", canRefresh: false, expiresInMinutes: null };
  }

  const expires = new Date(connection.tokenExpiresAt).getTime();
  const diffMinutes = Math.floor((expires - now.getTime()) / 60000);
  if (diffMinutes <= 0) {
    return { platform: connection.platform, status: "expired", canRefresh: connection.refreshable, expiresInMinutes: diffMinutes };
  }
  if (diffMinutes < 90) {
    return { platform: connection.platform, status: "expiring_soon", canRefresh: connection.refreshable, expiresInMinutes: diffMinutes };
  }
  return { platform: connection.platform, status: "valid", canRefresh: connection.refreshable, expiresInMinutes: diffMinutes };
}
