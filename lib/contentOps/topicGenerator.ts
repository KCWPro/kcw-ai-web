import { seedTopics } from "@/data/contentOps/seedTopics";
import type { Topic } from "@/lib/contentOps/types";

export type TopicGeneratorOptions = {
  limit?: number;
  language?: Topic["language"] | "any";
  platform?: Topic["platform"][number] | "any";
};

export function generateDailyTopics(options: TopicGeneratorOptions = {}): Topic[] {
  const { limit = 15, language = "any", platform = "any" } = options;

  const filtered = seedTopics.filter((topic) => {
    const matchLanguage = language === "any" || topic.language === language;
    const matchPlatform = platform === "any" || topic.platform.includes(platform);
    return matchLanguage && matchPlatform;
  });

  return filtered
    .sort((a, b) => {
      const scoreA = a.viral_score * 0.35 + a.lead_score * 0.35 + a.trust_score * 0.3 - a.duplication_risk;
      const scoreB = b.viral_score * 0.35 + b.lead_score * 0.35 + b.trust_score * 0.3 - b.duplication_risk;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function pickTopThreeForToday(topics: Topic[]) {
  return topics.slice(0, 3).map((topic) => ({
    topic,
    reason: `High composite fit (viral ${topic.viral_score}, lead ${topic.lead_score}, trust ${topic.trust_score}) with controlled AI-smell risk ${topic.ai_smell_risk}.`,
    execution: {
      fastest: "One-take talking head + auto subtitle cleanup + single CTA",
      standard: "Hook retake + 3 shot b-roll + concise caption",
      premium: "On-site sequence + close-up diagnosis visuals + bilingual caption split test",
    },
  }));
}
