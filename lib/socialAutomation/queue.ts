import type { ControlMode, PlatformConnection, PublishQueueItem, QueueStatus, ScriptAutomationPack, TopicPlan, VideoProductionTask } from "@/lib/socialAutomation/types";

function mapCapabilityToVisibility(capability: PlatformConnection["capability"], mode: ControlMode): PublishQueueItem["payload"]["visibility"] {
  if (mode === "manual_review") return "draft";
  if (capability === "public_ready" && mode === "controlled_auto_publish") return "public";
  if (capability === "private_only") return "private";
  return "draft";
}

export function buildPublishQueue(tasks: VideoProductionTask[], topics: TopicPlan[], scripts: ScriptAutomationPack[], mode: ControlMode, connections: PlatformConnection[]): PublishQueueItem[] {
  return tasks.map((task, index) => {
    const topic = topics.find((item) => item.id === task.topicPlanId);
    const script = scripts.find((item) => item.topicPlanId === task.topicPlanId);
    const connection = connections.find((item) => item.platform === task.output.postPackage.publishPayload.platform);
    const capability = connection?.capability ?? "manual_only";
    const visibility = mapCapabilityToVisibility(capability, mode);
    const downgraded = mode === "controlled_auto_publish" && capability !== "public_ready";
    const status: QueueStatus = mode === "manual_review" ? "waiting_manual_review" : downgraded ? "downgraded" : mode === "auto_draft" ? "draft_ready" : "queued";

    return {
      id: `pq_${index + 1}`,
      platform: task.output.postPackage.publishPayload.platform,
      status,
      topicPlanId: task.topicPlanId,
      scriptPackId: `sp_${task.topicPlanId}`,
      language: topic?.targetLanguage ?? "en",
      cta: script?.cta ?? topic?.recommendedCTA ?? "manual CTA required",
      capability,
      downgradeReason: downgraded ? connection?.capabilityReason ?? "platform capability gate" : null,
      payload: {
        ...task.output.postPackage.publishPayload,
        visibility,
      },
      needsManualReview: mode !== "controlled_auto_publish" || downgraded,
      createdAt: new Date().toISOString(),
    };
  });
}

const allowedTransitions: Record<QueueStatus, QueueStatus[]> = {
  queued: ["draft_ready", "waiting_manual_review", "publish_attempted", "failed", "downgraded"],
  draft_ready: ["waiting_manual_review", "publish_attempted", "failed", "downgraded"],
  waiting_manual_review: ["draft_ready", "publish_attempted", "failed"],
  publish_attempted: ["published", "failed", "downgraded"],
  published: [],
  failed: ["waiting_manual_review", "queued"],
  downgraded: ["draft_ready", "waiting_manual_review", "publish_attempted"],
};

export function transitionQueueStatus(current: QueueStatus, next: QueueStatus): QueueStatus {
  if (!allowedTransitions[current].includes(next)) {
    return current;
  }
  return next;
}
