import { readContentOpsState, writeContentOpsState } from "@/lib/contentOps/contentOpsStore";
import { detectLeadIntent } from "@/lib/contentOps/interactionStudio";

export async function GET() {
  const state = readContentOpsState();
  return Response.json({ success: true, items: state.interactions });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: "open" | "replied" | "waiting" | "escalated" | "closed";
      handoff_to_human?: boolean;
      text_for_detection?: string;
    };

    if (!body.id) return Response.json({ success: false, error: "id required" }, { status: 400 });

    let updated = false;
    const nextState = writeContentOpsState((state) => {
      state.interactions = state.interactions.map((item) => {
        if (item.id !== body.id) return item;
        updated = true;
        const detection = body.text_for_detection ? detectLeadIntent(body.text_for_detection) : null;
        return {
          ...item,
          status: body.status ?? item.status,
          handoff_to_human: typeof body.handoff_to_human === "boolean" ? body.handoff_to_human : item.handoff_to_human,
          intent_level: (detection?.lead_intent_level as "low" | "medium" | "high" | undefined) ?? item.intent_level,
          urgency_level: (detection?.urgency_level as "low" | "medium" | "high" | undefined) ?? item.urgency_level,
          suggested_next_step: detection?.suggested_next_action ?? item.suggested_next_step,
          updated_at: new Date().toISOString(),
        };
      });
      return state;
    });

    if (!updated) return Response.json({ success: false, error: "item not found" }, { status: 404 });
    return Response.json({ success: true, items: nextState.interactions });
  } catch {
    return Response.json({ success: false, error: "interaction update failed" }, { status: 500 });
  }
}
