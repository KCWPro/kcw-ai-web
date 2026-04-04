import { commentReplyBank, dmReplyBank } from "@/lib/contentOps/interactionStudio";
import type { ReplyDraft } from "@/lib/socialAutomation/types";

export function buildReplyDraftQueue(): ReplyDraft[] {
  const commentDrafts: ReplyDraft[] = commentReplyBank.slice(0, 3).map((item, index) => {
    const highRisk = item.urgency_signal === "high";
    const highLead = item.lead_signal === "high";
    return {
      id: `comment_${index + 1}`,
      channel: "comment",
      messageType: item.comment_type,
      inquiry: item.comment_type,
      draft: item.suggested_reply,
      leadLevel: item.lead_signal,
      urgency: item.urgency_signal,
      suggestedAction: highRisk ? "Manual takeover required before responding." : highLead ? "Invite to DM and collect project details." : "Reply with concise tip and CTA keyword.",
      escalateToHuman: highRisk || highLead,
      autoSendAllowed: false,
    };
  });

  const dmDrafts: ReplyDraft[] = dmReplyBank.slice(0, 3).map((item, index) => {
    const leadLevel = item.lead_score > 70 ? "high" : item.lead_score > 45 ? "medium" : "low";
    const urgency = item.urgency_level;
    const highRisk = urgency === "high";
    return {
      id: `dm_${index + 1}`,
      channel: "dm",
      messageType: item.inquiry_type,
      inquiry: item.inquiry_type,
      draft: item.suggested_reply,
      leadLevel,
      urgency,
      suggestedAction: highRisk ? "Escalate to sales/ops immediately; do not auto-send." : leadLevel === "high" ? "Escalate and schedule consult call." : `Ask for missing info: ${item.next_required_info.join(", ")}`,
      escalateToHuman: highRisk || leadLevel === "high",
      autoSendAllowed: false,
    };
  });

  return [...commentDrafts, ...dmDrafts];
}
