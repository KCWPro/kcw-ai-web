import { setControlMode } from "@/lib/socialAutomation/store";
import type { ControlMode } from "@/lib/socialAutomation/types";

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { mode?: ControlMode };
  if (!body.mode || !["manual_review", "auto_draft", "controlled_auto_publish"].includes(body.mode)) {
    return Response.json({ success: false, error: "invalid_mode" }, { status: 400 });
  }

  const snapshot = setControlMode(body.mode);
  return Response.json({ success: true, mode: snapshot.mode });
}
