import assert from "node:assert/strict";
import { buildFiveDayReviewFromAnalytics, normalizeAnalyticsRecord } from "../lib/socialAutomation/analytics";
import { buildSocialAutomationSnapshot } from "../lib/socialAutomation/controlPlane";
import { buildDegradedState } from "../lib/socialAutomation/degradedMode";
import { buildPublishQueue, transitionQueueStatus } from "../lib/socialAutomation/queue";
import { buildScriptPacks } from "../lib/socialAutomation/scriptAutomation";
import { resolveTokenHealth } from "../lib/socialAutomation/tokenModel";
import { buildDailyTopicPlan } from "../lib/socialAutomation/topicAutomation";
import { buildVideoProductionTasks } from "../lib/socialAutomation/videoPipeline";

(function run() {
  const topics = buildDailyTopicPlan(2);
  const scripts = buildScriptPacks(topics);
  const video = buildVideoProductionTasks(topics, scripts);
  const queue = buildPublishQueue(video, "auto_draft");

  // 1) topic/script to publish-payload transform
  assert.equal(video.length, 2);
  assert.equal(queue[0].payload.platform, topics[0].targetPlatform);
  assert.equal(queue[0].payload.isShortsReady, true);

  // 2) queue state transitions
  assert.equal(transitionQueueStatus("queued", "draft_ready"), "draft_ready");
  assert.equal(transitionQueueStatus("published", "failed"), "published");

  // 3) degraded mode behavior
  const degraded = buildDegradedState(buildSocialAutomationSnapshot().connections, queue);
  assert.ok(degraded.auditRestricted.includes("tiktok"));

  // 4) token state model
  const expired = resolveTokenHealth({
    platform: "youtube_shorts",
    state: "expired",
    oauthProvider: "official_oauth",
    scopes: [],
    scopeStatus: "missing",
    tokenExpiresAt: new Date(Date.now() - 1000).toISOString(),
    refreshable: true,
    auditRestricted: false,
    connectedUser: null,
    lastSyncedAt: null,
    accountId: null,
  });
  assert.equal(expired.status, "expired");

  // 5) draft/private fallback logic
  assert.equal(queue[0].payload.visibility, "private");

  // 6) analytics normalization
  const normalized = normalizeAnalyticsRecord({ postId: "p1", platform: "tiktok", views: 100 });
  assert.equal(normalized.likes, 0);
  assert.equal(normalized.views, 100);

  // 7) 5-day review auto-ingestion path
  const review = buildFiveDayReviewFromAnalytics([
    normalizeAnalyticsRecord({ postId: "a", platform: "tiktok", views: 10000, retention: 0.3, leadSignals: 4 }),
    normalizeAnalyticsRecord({ postId: "b", platform: "instagram_reels", views: 6000, retention: 0.31, leadSignals: 5 }),
  ]);
  assert.equal(review.goalMet, true);

  console.log("contentOpsSocialAutomationContract.test passed");
})();
