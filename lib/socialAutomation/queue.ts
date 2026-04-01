import type { ControlMode, PublishQueueItem, QueueStatus, VideoProductionTask } from "@/lib/socialAutomation/types";

export function buildPublishQueue(tasks: VideoProductionTask[], mode: ControlMode): PublishQueueItem[] {
  return tasks.map((task, index) => {
    const visibility = mode === "controlled_auto_publish" ? "public" : mode === "auto_draft" ? "private" : "draft";
    return {
      id: `pq_${index + 1}`,
      platform: task.output.postPackage.publishPayload.platform,
      status: mode === "manual_review" ? "needs_review" : "queued",
      topicPlanId: task.topicPlanId,
      scriptPackId: `sp_${task.topicPlanId}`,
      payload: {
        ...task.output.postPackage.publishPayload,
        visibility,
      },
      needsManualReview: mode !== "controlled_auto_publish",
      createdAt: new Date().toISOString(),
    };
  });
}

const allowedTransitions: Record<QueueStatus, QueueStatus[]> = {
  queued: ["draft_ready", "pending_platform", "failed", "needs_review"],
  draft_ready: ["pending_platform", "published", "failed", "needs_review"],
  pending_platform: ["published", "failed"],
  published: [],
  failed: ["queued", "needs_review"],
  needs_review: ["queued", "draft_ready", "failed"],
};

export function transitionQueueStatus(current: QueueStatus, next: QueueStatus): QueueStatus {
  if (!allowedTransitions[current].includes(next)) {
    return current;
  }
  return next;
}
