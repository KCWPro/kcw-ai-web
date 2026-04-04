import { buildFiveDayReviewFromAnalytics, normalizeAnalyticsRecord } from "@/lib/socialAutomation/analytics";
import { buildDefaultConnections, deriveConnectionState } from "@/lib/socialAutomation/connectionModel";
import { buildDegradedState } from "@/lib/socialAutomation/degradedMode";
import { buildPublishQueue } from "@/lib/socialAutomation/queue";
import { buildReplyDraftQueue } from "@/lib/socialAutomation/replyHub";
import { buildScriptPacks } from "@/lib/socialAutomation/scriptAutomation";
import { buildDailyTopicPlan } from "@/lib/socialAutomation/topicAutomation";
import type { ControlMode, PlatformConnection, SocialAutomationSnapshot, SocialPlatform } from "@/lib/socialAutomation/types";
import { buildVideoProductionTasks } from "@/lib/socialAutomation/videoPipeline";

export function buildSocialAutomationSnapshot(mode: ControlMode = "auto_draft", existingConnections?: PlatformConnection[]): SocialAutomationSnapshot {
  const connections = (existingConnections ?? buildDefaultConnections()).map(deriveConnectionState);
  const todayPlan = buildDailyTopicPlan(4);
  const scripts = buildScriptPacks(todayPlan);
  const videoTasks = buildVideoProductionTasks(todayPlan, scripts);
  const queue = buildPublishQueue(videoTasks, todayPlan, scripts, mode, connections);
  const replyQueue = buildReplyDraftQueue();
  const analytics = [
    normalizeAnalyticsRecord({ postId: "p1", platform: "tiktok", sourceType: "simulated/internal seed", views: 5000, retention: 0.24, likes: 220, comments: 35, shares: 18, saves: 14, follows: 11, profileVisits: 52, dmSignals: 4, leadSignals: 2 }),
    normalizeAnalyticsRecord({ postId: "p2", platform: "instagram_reels", sourceType: "simulated/internal seed", language: "en_audio_zh_sub", views: 7300, retention: 0.31, likes: 402, comments: 52, shares: 20, saves: 30, follows: 19, profileVisits: 65, dmSignals: 7, leadSignals: 4 }),
    normalizeAnalyticsRecord({ postId: "p3", platform: "youtube_shorts", sourceType: "simulated/internal seed", language: "zh_audio_en_sub", views: 3200, retention: 0.29, likes: 130, comments: 17, shares: 9, saves: 0, follows: 8, profileVisits: 0, dmSignals: 1, leadSignals: 1 }),
  ];
  const fiveDayReview = buildFiveDayReviewFromAnalytics(analytics);
  const degraded = buildDegradedState(connections, queue);

  return { mode, connections, queue, todayPlan, scripts, videoTasks, replyQueue, analytics, fiveDayReview, degraded };
}

export function updateConnectionState(connections: PlatformConnection[], platform: SocialPlatform, state: PlatformConnection["state"]): PlatformConnection[] {
  return connections.map((item) => (item.platform === platform ? deriveConnectionState({ ...item, state, lastSyncedAt: new Date().toISOString() }) : item));
}
