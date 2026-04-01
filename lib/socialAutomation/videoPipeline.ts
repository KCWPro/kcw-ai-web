import type { ScriptAutomationPack, TopicPlan, VideoProductionTask } from "@/lib/socialAutomation/types";

export function buildVideoProductionTasks(topics: TopicPlan[], scripts: ScriptAutomationPack[]): VideoProductionTask[] {
  return topics.map((topic) => {
    const script = scripts.find((item) => item.topicPlanId === topic.id);
    const usedScript = script?.standardScript ?? "Script unavailable";
    return {
      id: `vt_${topic.id}`,
      topicPlanId: topic.id,
      script: usedScript,
      subtitleText: script?.zhVersion ?? usedScript,
      voiceoverText: script?.enVersion ?? usedScript,
      assetReferences: topic.requiredAssets,
      template: topic.viralScore > 70 ? "before_after" : "faq_quick_answer",
      output: {
        aspectRatio: "9:16",
        coverText: topic.title.slice(0, 40),
        postPackage: {
          finalScript: usedScript,
          subtitleFile: `${topic.id}.srt`,
          caption: script?.caption ?? "",
          assetManifest: topic.requiredAssets,
          publishPayload: {
            platform: topic.targetPlatform,
            title: topic.title,
            description: `${script?.caption ?? ""}\nCTA: ${topic.recommendedCTA}`,
            hashtags: script?.hashtags ?? [],
            visibility: "draft",
            mediaUrl: `https://cdn.kcw.local/draft/${topic.id}.mp4`,
            isShortsReady: true,
          },
        },
      },
    };
  });
}
