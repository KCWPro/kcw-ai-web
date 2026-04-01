import { seedTopics } from "@/data/contentOps/seedTopics";
import { generateScriptPack } from "@/lib/contentOps/scriptGenerator";
import type { ScriptAutomationPack, TopicPlan } from "@/lib/socialAutomation/types";

export function buildScriptPacks(topicPlans: TopicPlan[]): ScriptAutomationPack[] {
  return topicPlans.map((plan) => {
    const sourceTopic = seedTopics.find((item) => item.id === plan.sourceTopicId) ?? seedTopics[0];
    const base = generateScriptPack(sourceTopic);
    const standardScript = base.standard_script;
    const zhVersion = `【中文口播】${base.standard_script}`;
    return {
      topicPlanId: plan.id,
      hooks: [
        base.hook_variants[0] ?? "先别急着修，先看这一步。",
        base.hook_variants[1] ?? "这类问题 80% homeowner 都会踩坑。",
        base.hook_variants[2] ?? "本地师傅给你一个省钱判断法。",
      ],
      shortScript: base.short_script,
      standardScript,
      extendedScript: base.long_script,
      caption: base.caption,
      hashtags: base.hashtags,
      pinnedComment: base.pinned_comment,
      cta: base.CTA,
      enVersion: standardScript,
      zhVersion,
      enAudioZhSubtitleTip: "EN audio + ZH subtitle: keep technical nouns in English and local terms in Chinese.",
      zhAudioEnSubtitleTip: "ZH audio + EN subtitle: keep sentence short and avoid machine-like literal translation.",
    };
  });
}
