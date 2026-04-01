import { commentReplyBank, dmReplyBank } from "@/lib/contentOps/interactionStudio";
import type { ReplyDraft } from "@/lib/socialAutomation/types";

export function buildReplyDraftQueue(): ReplyDraft[] {
  const commentDrafts: ReplyDraft[] = commentReplyBank.slice(0, 3).map((item, index) => ({
    id: `comment_${index + 1}`,
    channel: "comment",
    inquiry: item.comment_type,
    draft: item.suggested_reply,
    leadIntent: item.lead_signal,
    riskLevel: item.urgency_signal,
    suggestedNextStep: item.lead_signal === "high" ? "Invite to DM for estimate details." : "Answer and keep thread warm.",
    escalateToHuman: item.lead_signal === "high",
    autoSendAllowed: false,
  }));

  const dmDrafts: ReplyDraft[] = dmReplyBank.slice(0, 3).map((item, index) => ({
    id: `dm_${index + 1}`,
    channel: "dm",
    inquiry: item.inquiry_type,
    draft: item.suggested_reply,
    leadIntent: item.lead_score > 70 ? "high" : item.lead_score > 45 ? "medium" : "low",
    riskLevel: item.urgency_level,
    suggestedNextStep: item.next_required_info.join("; "),
    escalateToHuman: item.lead_score > 70,
    autoSendAllowed: false,
  }));

  return [...commentDrafts, ...dmDrafts];
}
