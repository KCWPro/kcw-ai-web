import type { Topic, VideoFormat } from "@/lib/contentOps/types";

export function selectVideoFormat(topic: Topic): VideoFormat {
  if (topic.pillar === "real_case") return "before_after";
  if (topic.pillar === "quote_education") return "quote_education";
  if (topic.pillar === "mistakes_to_avoid") return "dont_do_this";
  if (topic.pillar === "maintenance") return "top_3_tips";
  if (topic.pillar === "local_reminder") return "local_service_reminder";
  if (topic.pillar === "trust_knowledge") return "myth_busting";
  return topic.format_recommendation;
}
