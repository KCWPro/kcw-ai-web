export const quoteDraftMock = {
  lead_id: "lead-1002",
  customer_name: "Sarah Nguyen",
  city: "Roseville",
  service_type: "Water heater replacement",
  urgency: "medium",
  scope_summary:
    "Replace aging 50-gallon unit, update venting connection, install expansion tank, and test full hot water cycle.",
  suggested_pricing_range: "$2,900 - $4,100",
  customer_facing_draft_text:
    "Hi Sarah, thanks for speaking with KCW Plumbing. Based on your current water heater age and usage needs, we recommend replacement with either a standard reliable model or a high-efficiency option. Estimated total project range is $2,900 to $4,100 including installation, haul-away, and safety testing. We can confirm final pricing after a quick on-site check and schedule installation this week.",
  internal_notes:
    "Customer is price-aware but values warranty. Offer financing and mention energy savings for higher-tier option.",
};

export const followUpMock = {
  lead_id: "lead-1003",
  customer_name: "Robert Chen",
  service_type: "Drain cleaning + camera inspection",
  follow_up_timing_suggestion: "Reach out today between 4:30 PM - 6:00 PM (post-work response window).",
  urgency_note: "Medium urgency: symptoms are worsening but no active overflow yet.",
  sms_draft_en:
    "Hi Robert, this is KCW Plumbing following up on your drain issue. We have a morning slot tomorrow for drain cleaning with optional camera inspection. Would you like us to reserve it for you?",
  wechat_draft_zh:
    "Robert 您好，我是 KCW 管道团队，跟进您家下水变慢的问题。我们明天上午有可预约时段，可安排管道疏通并可选做管道内窥检查。需要我先帮您预留吗？",
};
