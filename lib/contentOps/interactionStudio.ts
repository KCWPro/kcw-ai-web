import type { CommentReply, DmReply } from "@/lib/contentOps/types";

export const commentReplyBank: CommentReply[] = [
  { post_id: "generic", comment_type: "price_question", reply_style: "concise", suggested_reply: "价格会看问题位置和可达性。你可以说下是厨房/浴室/室外，我们给你先判断大概方向。", lead_signal: "medium", urgency_signal: "low" },
  { post_id: "generic", comment_type: "diy_question", reply_style: "professional", suggested_reply: "能先做基础检查，但如果有持续漏水/异味/煤气风险，建议先停手并尽快找本地专业人员现场判断。", lead_signal: "medium", urgency_signal: "high" },
  { post_id: "generic", comment_type: "my_house_too", reply_style: "casual", suggested_reply: "这个情况很常见。你家是单个点位还是全屋都有？我可以给你一个先排查顺序。", lead_signal: "high", urgency_signal: "medium" },
  { post_id: "generic", comment_type: "service_area", reply_style: "dm_guide", suggested_reply: "我们主要做南加州本地。你可以私信城市和问题视频，我们先帮你判断下一步。", lead_signal: "high", urgency_signal: "low" },
];

export const dmReplyBank: DmReply[] = [
  {
    inquiry_type: "quote_consult",
    urgency_level: "medium",
    response_style: "professional",
    suggested_reply: "收到，我们先帮你快速判断。方便发一下：1) 城市 2) 问题出现位置 3) 发生多久了 4) 是否有漏水/异味/无法使用。",
    next_required_info: ["city", "problem_location", "duration", "safety_signal"],
    lead_score: 78,
  },
  {
    inquiry_type: "emergency",
    urgency_level: "high",
    response_style: "safety_first",
    suggested_reply: "如果有煤气味道或持续大量漏水，请先确保安全：关闭相关阀门并联系当地紧急支持。你可同步发地址区域和现状，我们安排人工优先跟进。",
    next_required_info: ["safety_status", "city", "callback_number"],
    lead_score: 95,
  },
  {
    inquiry_type: "service_area",
    urgency_level: "low",
    response_style: "friendly",
    suggested_reply: "我们主要覆盖南加州。你可以先告诉我城市和房屋类型，我帮你确认是否在服务范围内。",
    next_required_info: ["city", "property_type"],
    lead_score: 60,
  },
];

export function detectLeadIntent(text: string) {
  const normalized = text.toLowerCase();
  const highIntentKeywords = ["quote", "price", "book", "appointment", "address", "dm", "call me"];
  const emergencyKeywords = ["gas smell", "burst", "flood", "no water", "major leak"];

  const leadIntentLevel = highIntentKeywords.some((kw) => normalized.includes(kw)) ? "high" : "medium";
  const urgencyLevel = emergencyKeywords.some((kw) => normalized.includes(kw)) ? "high" : "low";

  return {
    lead_intent_level: leadIntentLevel,
    urgency_level: urgencyLevel,
    suggested_next_action:
      urgencyLevel === "high"
        ? "Prioritize safety response and handoff to human operator."
        : "Collect city + symptom + timeline, then guide to DM/form.",
  };
}
