import { buildDegradedState } from "@/lib/socialAutomation/degradedMode";
import { updateConnectionState } from "@/lib/socialAutomation/controlPlane";
import { readSocialAutomationState, writeSocialAutomationState } from "@/lib/socialAutomation/store";
import type { ConnectionState, SocialPlatform } from "@/lib/socialAutomation/types";

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { platform?: SocialPlatform; state?: ConnectionState };
  if (!body.platform || !body.state) {
    return Response.json({ success: false, error: "platform_and_state_required" }, { status: 400 });
  }

  const current = readSocialAutomationState();
  const connections = updateConnectionState(current.connections, body.platform, body.state);
  const degraded = buildDegradedState(connections, current.queue);
  const next = writeSocialAutomationState({ ...current, connections, degraded });

  return Response.json({ success: true, connections: next.connections, degraded: next.degraded });
}
