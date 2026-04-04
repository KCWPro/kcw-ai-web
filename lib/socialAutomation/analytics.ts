import type { FiveDayAutoReview, NormalizedAnalytics } from "@/lib/socialAutomation/types";

export function normalizeAnalyticsRecord(input: Partial<NormalizedAnalytics> & { postId: string; platform: NormalizedAnalytics["platform"] }): NormalizedAnalytics {
  return {
    postId: input.postId,
    platform: input.platform,
    language: input.language ?? "en",
    hookVariant: input.hookVariant ?? "hook_a",
    ctaType: input.ctaType ?? "comment",
    monetizationLabel: input.monetizationLabel ?? "lead_capture",
    sourceType: input.sourceType ?? "normalized",
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

  const recommendedAction = weakMetrics.includes("retention")
    ? "Tighten first 3 seconds, keep one CTA per short, and run manual quality review for 5 days."
    : weakMetrics.length
      ? "Keep draft-only mode and revise CTA mapping by platform before expanding."
      : "Expand winning format to all connected platforms with controlled publish gates.";

  return {
    goalMet,
    weakMetrics,
    recommendedAction,
    recommendation: goalMet ? "expand" : weakMetrics.length > 1 ? "stop" : "repeat",
  };
}
