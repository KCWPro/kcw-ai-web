import { commentReplyBank, dmReplyBank } from "@/lib/contentOps/interactionStudio";
import type { ReplyDraft } from "@/lib/socialAutomation/types";

export function buildReplyDraftQueue(): ReplyDraft[] {
  const commentDrafts: ReplyDraft[] = commentReplyBank.slice(0, 3).map((item, index) => ({
    id: `comment_${index + 1}`,
    channel: "comment",
    messageType: item.comment_type,
    inquiry: item.comment_type,
    draft: item.suggested_reply,
    leadIntent: item.lead_signal,
    riskLevel: item.urgency_signal,
    urgency: item.urgency_signal,
    suggestedNextStep: item.urgency_signal === "high" ? "Manual take-over required before posting a reply." : item.lead_signal === "high" ? "Invite to DM for estimate details." : "Answer and keep thread warm.",
    escalateToHuman: item.lead_signal === "high" || item.urgency_signal === "high",
    autoSendAllowed: false,
  }));

  const dmDrafts: ReplyDraft[] = dmReplyBank.slice(0, 3).map((item, index) => {
    const leadIntent = item.lead_score > 70 ? "high" : item.lead_score > 45 ? "medium" : "low";
    return {
      id: `dm_${index + 1}`,
      channel: "dm",
      messageType: item.inquiry_type,
      inquiry: item.inquiry_type,
      draft: item.suggested_reply,
      leadIntent,
      riskLevel: item.urgency_level,
      urgency: item.urgency_level,
      suggestedNextStep: item.urgency_level === "high" ? "Escalate to human ops immediately." : item.next_required_info.join("; "),
      escalateToHuman: leadIntent === "high" || item.urgency_level === "high",
      autoSendAllowed: false,
    };
  });

  return [...commentDrafts, ...dmDrafts];
}
