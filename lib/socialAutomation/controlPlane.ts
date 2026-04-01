import { buildFiveDayReviewFromAnalytics, normalizeAnalyticsRecord } from "@/lib/socialAutomation/analytics";
import { buildDegradedState } from "@/lib/socialAutomation/degradedMode";
import { buildPublishQueue } from "@/lib/socialAutomation/queue";
import { buildReplyDraftQueue } from "@/lib/socialAutomation/replyHub";
import { buildScriptPacks } from "@/lib/socialAutomation/scriptAutomation";
import { buildDailyTopicPlan } from "@/lib/socialAutomation/topicAutomation";
import type { ControlMode, PlatformConnection, SocialAutomationSnapshot, SocialPlatform } from "@/lib/socialAutomation/types";
import { buildVideoProductionTasks } from "@/lib/socialAutomation/videoPipeline";

export function buildDefaultConnections(now = new Date()): PlatformConnection[] {
  const plusHours = (hours: number) => new Date(now.getTime() + hours * 3600 * 1000).toISOString();
  return [
    {
      platform: "tiktok",
      state: "restricted",
      oauthProvider: "official_oauth",
      scopes: ["user.info.basic", "video.publish"],
      scopeStatus: "ok",
      tokenExpiresAt: plusHours(1),
      refreshable: true,
      auditRestricted: true,
      connectedUser: "@kcw_construction",
      lastSyncedAt: now.toISOString(),
      accountId: "tt_123",
    },
    {
      platform: "instagram_reels",
      state: "connected",
      oauthProvider: "official_oauth",
      scopes: ["instagram_business_content_publish", "instagram_business_basic"],
      scopeStatus: "ok",
      tokenExpiresAt: plusHours(12),
      refreshable: true,
      auditRestricted: false,
      connectedUser: "kcw.plumbing",
      lastSyncedAt: now.toISOString(),
      accountId: "ig_123",
    },
    {
      platform: "youtube_shorts",
      state: "expired",
      oauthProvider: "official_oauth",
      scopes: ["youtube.upload", "youtube.readonly"],
      scopeStatus: "ok",
      tokenExpiresAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      refreshable: true,
      auditRestricted: false,
      connectedUser: "KCW Construction",
      lastSyncedAt: null,
      accountId: "yt_123",
    },
  ];
}

export function buildSocialAutomationSnapshot(mode: ControlMode = "auto_draft"): SocialAutomationSnapshot {
  const connections = buildDefaultConnections();
  const todayPlan = buildDailyTopicPlan(4);
  const scripts = buildScriptPacks(todayPlan);
  const videoTasks = buildVideoProductionTasks(todayPlan, scripts);
  const queue = buildPublishQueue(videoTasks, mode);
  const replyQueue = buildReplyDraftQueue();
  const analytics = [
    normalizeAnalyticsRecord({ postId: "p1", platform: "tiktok", views: 5000, retention: 0.24, likes: 220, comments: 35, shares: 18, saves: 14, follows: 11, profileVisits: 52, dmSignals: 4, leadSignals: 2 }),
    normalizeAnalyticsRecord({ postId: "p2", platform: "instagram_reels", language: "en_audio_zh_sub", views: 7300, retention: 0.31, likes: 402, comments: 52, shares: 20, saves: 30, follows: 19, profileVisits: 65, dmSignals: 7, leadSignals: 4 }),
    normalizeAnalyticsRecord({ postId: "p3", platform: "youtube_shorts", language: "zh_audio_en_sub", views: 3200, retention: 0.29, likes: 130, comments: 17, shares: 9, saves: 0, follows: 8, profileVisits: 0, dmSignals: 1, leadSignals: 1 }),
  ];
  const fiveDayReview = buildFiveDayReviewFromAnalytics(analytics);
  const degraded = buildDegradedState(connections, queue);

  return { mode, connections, queue, todayPlan, scripts, videoTasks, replyQueue, analytics, fiveDayReview, degraded };
}

export function updateConnectionState(connections: PlatformConnection[], platform: SocialPlatform, state: PlatformConnection["state"]): PlatformConnection[] {
  return connections.map((item) => (item.platform === platform ? { ...item, state, lastSyncedAt: new Date().toISOString() } : item));
}
