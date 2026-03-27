import { applyReviewAction, type ReviewAction } from "@/lib/contentOps/reviewWorkflow";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      entity?: "script" | "post_plan";
      id?: string;
      action?: ReviewAction;
      reviewer_notes?: string;
      updated_by?: string;
    };

    if (!body.entity || !body.id || !body.action) {
      return Response.json({ success: false, error: "entity, id, action are required" }, { status: 400 });
    }

    const result = applyReviewAction({
      entity: body.entity,
      id: body.id,
      action: body.action,
      reviewer_notes: body.reviewer_notes ?? "",
      updated_by: body.updated_by,
    });

    if (!result.success) {
      return Response.json({ success: false, error: "target not found" }, { status: 404 });
    }

    return Response.json({ success: true, review_funnel: result.review_funnel });
  } catch {
    return Response.json({ success: false, error: "review action failed" }, { status: 500 });
  }
}
