import { readContentOpsState, writeContentOpsState } from "@/lib/contentOps/contentOpsStore";

export async function GET() {
  const state = readContentOpsState();
  return Response.json({ success: true, tasks: state.executionTasks });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      task_id?: string;
      status?: "planned" | "filmed" | "edited" | "posted" | "reviewed";
      comments_replied?: boolean;
      dms_handled?: boolean;
      hot_lead_escalated?: boolean;
      checked_in?: boolean;
    };

    if (!body.task_id) {
      return Response.json({ success: false, error: "task_id required" }, { status: 400 });
    }

    let updated = false;
    const nextState = writeContentOpsState((state) => {
      state.executionTasks = state.executionTasks.map((task) => {
        if (task.task_id !== body.task_id) return task;
        updated = true;
        return {
          ...task,
          status: body.status ?? task.status,
          comments_replied: typeof body.comments_replied === "boolean" ? body.comments_replied : task.comments_replied,
          dms_handled: typeof body.dms_handled === "boolean" ? body.dms_handled : task.dms_handled,
          hot_lead_escalated: typeof body.hot_lead_escalated === "boolean" ? body.hot_lead_escalated : task.hot_lead_escalated,
          checked_in: typeof body.checked_in === "boolean" ? body.checked_in : task.checked_in,
        };
      });
      return state;
    });

    if (!updated) {
      return Response.json({ success: false, error: "task not found" }, { status: 404 });
    }

    return Response.json({ success: true, tasks: nextState.executionTasks });
  } catch {
    return Response.json({ success: false, error: "execution update failed" }, { status: 500 });
  }
}
