import { seedTopics } from "@/data/contentOps/seedTopics";
import type { TopicPlan } from "@/lib/socialAutomation/types";

const SUPPORTED = ["tiktok", "instagram_reels", "youtube_shorts"] as const;

export function buildDailyTopicPlan(limit = 3): TopicPlan[] {
  return seedTopics
    .filter((topic) => topic.platform.some((platform) => SUPPORTED.includes(platform as (typeof SUPPORTED)[number])))
    .slice(0, limit)
    .map((topic, index) => {
      const targetPlatform = (topic.platform.find((platform) => SUPPORTED.includes(platform as never)) ?? "tiktok") as TopicPlan["targetPlatform"];
      return {
        id: `tp_${topic.id}`,
        title: topic.title,
        angle: topic.angle,
        targetPlatform,
        targetLanguage: topic.language,
        viralScore: topic.viral_score,
        leadScore: topic.lead_score,
        realismScore: topic.realism_score,
        aiSmellRisk: topic.ai_smell_risk,
        duplicationRisk: topic.duplication_risk,
        recommendedCTA: index % 2 === 0 ? "Comment \"QUOTE\" for an estimate checklist." : "DM us your ZIP + issue for local advice.",
        monetizationLabel: topic.lead_score > 72 ? "lead_capture" : "education_only",
        requiredAssets: topic.asset_requirements,
        sourceTopicId: topic.id,
      };
    });
}
