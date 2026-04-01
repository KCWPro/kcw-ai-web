import { buildSocialAutomationSnapshot } from "@/lib/socialAutomation/controlPlane";
import type { ControlMode, SocialAutomationSnapshot } from "@/lib/socialAutomation/types";

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
  const next = buildSocialAutomationSnapshot(mode);
  inMemorySnapshot = { ...next, connections: current.connections };
  return inMemorySnapshot;
}
