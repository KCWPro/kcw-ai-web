import type { ControlMode, PlatformConnection, PublishCapability, PublishQueueItem, QueueStatus, VideoProductionTask } from "@/lib/socialAutomation/types";

function resolveVisibility(mode: ControlMode, capability: PublishCapability) {
  if (mode === "manual_review") return { visibility: "draft" as const, status: "waiting_manual_review" as const, needsManualReview: true, downgradedReason: "manual_mode" };
  if (mode === "auto_draft") return { visibility: "draft" as const, status: "draft_ready" as const, needsManualReview: true, downgradedReason: "auto_draft_mode" };

  if (capability === "public_ready") return { visibility: "public" as const, status: "publish_attempted" as const, needsManualReview: false, downgradedReason: undefined };
  if (capability === "private_only") return { visibility: "private" as const, status: "downgraded" as const, needsManualReview: true, downgradedReason: "platform_private_only" };
  if (capability === "draft_only") return { visibility: "draft" as const, status: "downgraded" as const, needsManualReview: true, downgradedReason: "platform_draft_only" };
  return { visibility: "draft" as const, status: "downgraded" as const, needsManualReview: true, downgradedReason: "capability_restricted_or_manual_only" };
}

export function buildPublishQueue(tasks: VideoProductionTask[], mode: ControlMode, connections: PlatformConnection[]): PublishQueueItem[] {
  return tasks.map((task, index) => {
    const connection = connections.find((item) => item.platform === task.output.postPackage.publishPayload.platform);
    const capability = connection?.publishCapability ?? "manual_only";
    const flow = resolveVisibility(mode, capability);

    return {
      id: `pq_${index + 1}`,
      platform: task.output.postPackage.publishPayload.platform,
      status: flow.status,
      topicPlanId: task.topicPlanId,
      scriptPackId: `sp_${task.topicPlanId}`,
      language: index % 2 === 0 ? "en_audio_zh_sub" : "zh_audio_en_sub",
      cta: task.output.postPackage.cta,
      publishCapability: capability,
      payload: {
        ...task.output.postPackage.publishPayload,
        visibility: flow.visibility,
      },
      downgradedReason: flow.downgradedReason,
      needsManualReview: flow.needsManualReview,
      createdAt: new Date().toISOString(),
    };
  });
}

const allowedTransitions: Record<QueueStatus, QueueStatus[]> = {
  queued: ["draft_ready", "waiting_manual_review", "publish_attempted", "failed", "downgraded"],
  draft_ready: ["waiting_manual_review", "publish_attempted", "failed", "downgraded"],
  waiting_manual_review: ["draft_ready", "publish_attempted", "failed", "downgraded"],
  publish_attempted: ["published", "failed", "downgraded"],
  published: [],
  failed: ["queued", "waiting_manual_review"],
  downgraded: ["waiting_manual_review", "draft_ready", "publish_attempted", "failed"],
};

export function transitionQueueStatus(current: QueueStatus, next: QueueStatus): QueueStatus {
  if (!allowedTransitions[current].includes(next)) {
    return current;
  }
  return next;
}
