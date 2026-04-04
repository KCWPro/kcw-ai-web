import type { ScriptAutomationPack, TopicPlan, VideoProductionTask } from "@/lib/socialAutomation/types";

export function buildVideoProductionTasks(topics: TopicPlan[], scripts: ScriptAutomationPack[]): VideoProductionTask[] {
  return topics.map((topic) => {
    const script = scripts.find((item) => item.topicPlanId === topic.id);
    const usedScript = script?.standardScript ?? "Script unavailable";
    const subtitleFilename = `${topic.id}.srt`;
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
          title: topic.title,
          caption: script?.caption ?? "Draft caption pending manual enhancement.",
          hashtags: script?.hashtags ?? [],
          pinnedComment: script?.pinnedComment ?? "Comment \"QUOTE\" for next steps.",
          subtitleFilename,
          subtitleManifest: `manifest/${topic.id}.json`,
          assetList: topic.requiredAssets,
          publishPayload: {
            platform: topic.targetPlatform,
            title: topic.title,
            description: `${script?.caption ?? "Draft package"}\nCTA: ${topic.recommendedCTA}`,
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
