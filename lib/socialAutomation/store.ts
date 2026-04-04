import { buildSocialAutomationSnapshot } from "@/lib/socialAutomation/controlPlane";
import type { ConnectionPersistence } from "@/lib/socialAutomation/oauthPersistence";
import type { ControlMode, PlatformConnection, SocialAutomationSnapshot, SocialPlatform } from "@/lib/socialAutomation/types";

let inMemorySnapshot: SocialAutomationSnapshot | null = null;

export function readSocialAutomationState(): SocialAutomationSnapshot {
  if (!inMemorySnapshot) {
    inMemorySnapshot = buildSocialAutomationSnapshot("auto_draft");
  }
  return inMemorySnapshot;
}

export function writeSocialAutomationState(next: SocialAutomationSnapshot): SocialAutomationSnapshot {
  inMemorySnapshot = next;
  return inMemorySnapshot;
}

export function setControlMode(mode: ControlMode): SocialAutomationSnapshot {
  const current = readSocialAutomationState();
  const next = buildSocialAutomationSnapshot(mode, current.connections);
  inMemorySnapshot = next;
  return inMemorySnapshot;
}

export const inMemoryConnectionPersistence: ConnectionPersistence = {
  upsertConnection(platform: SocialPlatform, patch: Partial<PlatformConnection>) {
    const current = readSocialAutomationState();
    const target = current.connections.find((item) => item.platform === platform);
    if (!target) return null;
    const nextConnections = current.connections.map((item) => (item.platform === platform ? { ...item, ...patch } : item));
    inMemorySnapshot = { ...current, connections: nextConnections };
    return inMemorySnapshot.connections.find((item) => item.platform === platform) ?? null;
  },
};
