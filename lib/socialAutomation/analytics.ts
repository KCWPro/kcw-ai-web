import type { FiveDayAutoReview, NormalizedAnalytics } from "@/lib/socialAutomation/types";

export function normalizeAnalyticsRecord(input: Partial<NormalizedAnalytics> & { postId: string; platform: NormalizedAnalytics["platform"] }): NormalizedAnalytics {
  return {
    postId: input.postId,
    platform: input.platform,
    language: input.language ?? "en",
    hookVariant: input.hookVariant ?? "hook_a",
    ctaType: input.ctaType ?? "comment",
    monetizationLabel: input.monetizationLabel ?? "lead_capture",
    views: input.views ?? 0,
    watchTime: input.watchTime ?? 0,
    retention: input.retention ?? 0,
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    shares: input.shares ?? 0,
    saves: input.saves ?? 0,
    follows: input.follows ?? 0,
    profileVisits: input.profileVisits ?? 0,
    dmSignals: input.dmSignals ?? 0,
    leadSignals: input.leadSignals ?? 0,
    source: input.source ?? "normalized",
  };
}

export function buildFiveDayReviewFromAnalytics(records: NormalizedAnalytics[]): FiveDayAutoReview {
  const totals = records.reduce(
    (acc, item) => {
      acc.views += item.views;
      acc.retention += item.retention;
      acc.leadSignals += item.leadSignals;
      return acc;
    },
    { views: 0, retention: 0, leadSignals: 0 },
  );

  const avgRetention = records.length ? totals.retention / records.length : 0;
  const goalMet = totals.views >= 15000 && avgRetention >= 0.28 && totals.leadSignals >= 8;

  const weakMetrics: string[] = [];
  if (totals.views < 15000) weakMetrics.push("views");
  if (avgRetention < 0.28) weakMetrics.push("retention");
  if (totals.leadSignals < 8) weakMetrics.push("lead_signals");

  return {
    goalMet,
    weakMetrics,
    rootCauses: weakMetrics.length ? ["Hook clarity mismatch", "CTA too soft for local homeowner intent"] : ["Momentum stable"],
    nextCycleStrategy: weakMetrics.includes("retention") ? "Shift to FAQ and before-after formats with tighter first 3 seconds." : "Scale winning hooks to all 3 platforms.",
    recommendedAction: weakMetrics.length ? "Adjust hooks and CTA, then rerun with manual review." : "Increase volume on winning topic clusters.",
    recommendation: goalMet ? "expand" : weakMetrics.length > 1 ? "stop" : "repeat",
  };
}
