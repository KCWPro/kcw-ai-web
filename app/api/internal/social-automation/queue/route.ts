import { transitionQueueStatus } from "@/lib/socialAutomation/queue";
import { readSocialAutomationState, writeSocialAutomationState } from "@/lib/socialAutomation/store";
import type { QueueStatus } from "@/lib/socialAutomation/types";

export async function GET() {
  const snapshot = readSocialAutomationState();
  return Response.json({ success: true, queue: snapshot.queue });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { id?: string; nextStatus?: QueueStatus; error?: string };
  if (!body.id || !body.nextStatus) {
    return Response.json({ success: false, error: "id_and_next_status_required" }, { status: 400 });
  }

  const current = readSocialAutomationState();
  const queue = current.queue.map((item) => {
    if (item.id !== body.id) return item;
    return {
      ...item,
      status: transitionQueueStatus(item.status, body.nextStatus!),
      error: body.error,
    };
  });

  const next = writeSocialAutomationState({ ...current, queue });
  return Response.json({ success: true, queue: next.queue });
}
