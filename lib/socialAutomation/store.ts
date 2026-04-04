import { buildDegradedState } from "@/lib/socialAutomation/degradedMode";
import { buildSocialAutomationSnapshot } from "@/lib/socialAutomation/controlPlane";
import { buildPublishQueue } from "@/lib/socialAutomation/queue";
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

export function savePlatformConnection(platform: SocialPlatform, patch: Partial<PlatformConnection>): SocialAutomationSnapshot {
  const current = readSocialAutomationState();
  const connections = current.connections.map((item) => (item.platform === platform ? { ...item, ...patch, lastSyncedAt: new Date().toISOString() } : item));
  const queue = buildPublishQueue(current.videoTasks, current.mode, connections);
  const degraded = buildDegradedState(connections, queue);
  return writeSocialAutomationState({ ...current, connections, queue, degraded });
}

export function setControlMode(mode: ControlMode): SocialAutomationSnapshot {
  const current = readSocialAutomationState();
  const queue = buildPublishQueue(current.videoTasks, mode, current.connections);
  const degraded = buildDegradedState(current.connections, queue);
  return writeSocialAutomationState({ ...current, mode, queue, degraded });
}
