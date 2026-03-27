import { writeContentOpsState } from "@/lib/contentOps/contentOpsStore";
import type { ReviewStatus, ReviewVersion } from "@/lib/contentOps/types";

export type ReviewAction = "mark_reviewed" | "approve" | "reject" | "revert_to_draft";

function toStatus(action: ReviewAction): ReviewStatus {
  if (action === "mark_reviewed") return "reviewed";
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  return "draft";
}

function buildVersion(status: ReviewStatus, notes: string, summary: string, updatedBy: string): ReviewVersion {
  const now = new Date().toISOString();
  return {
    version_id: `ver_${now.replace(/[^0-9]/g, "").slice(-12)}`,
    created_at: now,
    updated_by: updatedBy,
    status,
    notes,
    summary,
  };
}

export function applyReviewAction(input: {
  entity: "script" | "post_plan";
  id: string;
  action: ReviewAction;
  reviewer_notes: string;
  updated_by?: string;
}) {
  const nextStatus = toStatus(input.action);
  const updatedBy = input.updated_by ?? "reviewer_manual";

  let updated = false;
  const nextState = writeContentOpsState((state) => {
    if (input.entity === "script") {
      state.scripts = state.scripts.map((script) => {
        if (script.id !== input.id) return script;
        updated = true;
        return {
          ...script,
          review_status: nextStatus,
          reviewer_notes: input.reviewer_notes,
          version_history: [
            ...script.version_history,
            buildVersion(nextStatus, input.reviewer_notes, `Review action: ${input.action}`, updatedBy),
          ],
        };
      });
    } else {
      state.postPlans = state.postPlans.map((plan) => {
        if (plan.id !== input.id) return plan;
        updated = true;
        return {
          ...plan,
          review_status: nextStatus,
          reviewer_notes: input.reviewer_notes,
          version_history: [
            ...plan.version_history,
            buildVersion(nextStatus, input.reviewer_notes, `Review action: ${input.action}`, updatedBy),
          ],
        };
      });
    }
    return state;
  });

  return {
    success: updated,
    review_funnel: {
      draft: nextState.scripts.filter((s) => s.review_status === "draft").length + nextState.postPlans.filter((p) => p.review_status === "draft").length,
      reviewed:
        nextState.scripts.filter((s) => s.review_status === "reviewed").length +
        nextState.postPlans.filter((p) => p.review_status === "reviewed").length,
      approved:
        nextState.scripts.filter((s) => s.review_status === "approved").length +
        nextState.postPlans.filter((p) => p.review_status === "approved").length,
      rejected:
        nextState.scripts.filter((s) => s.review_status === "rejected").length +
        nextState.postPlans.filter((p) => p.review_status === "rejected").length,
    },
  };
}
