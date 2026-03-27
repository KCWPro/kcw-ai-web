import type { PerformanceRecord } from "@/lib/contentOps/types";

export type FiveDayMode = "conservative" | "standard" | "sprint";

export type FiveDayKPI = {
  total_views: number;
  avg_views: number;
  avg_retention: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  follows: number;
  profile_visits: number;
  dms: number;
  local_lead_signals: number;
};

const modeTarget: Record<FiveDayMode, FiveDayKPI> = {
  conservative: { total_views: 6000, avg_views: 1200, avg_retention: 0.24, likes: 200, comments: 30, saves: 20, shares: 12, follows: 20, profile_visits: 70, dms: 10, local_lead_signals: 5 },
  standard: { total_views: 10000, avg_views: 2000, avg_retention: 0.3, likes: 350, comments: 60, saves: 45, shares: 25, follows: 40, profile_visits: 120, dms: 20, local_lead_signals: 10 },
  sprint: { total_views: 18000, avg_views: 3600, avg_retention: 0.34, likes: 700, comments: 120, saves: 90, shares: 55, follows: 80, profile_visits: 220, dms: 35, local_lead_signals: 18 },
};

export function runFiveDayReview(records: PerformanceRecord[], mode: FiveDayMode) {
  const target = modeTarget[mode];
  const totalViews = records.reduce((sum, item) => sum + item.views, 0);
  const avgViews = records.length ? totalViews / records.length : 0;
  const avgRetention = records.length ? records.reduce((sum, item) => sum + item.retention, 0) / records.length : 0;
  const likes = records.reduce((sum, item) => sum + item.likes, 0);
  const comments = records.reduce((sum, item) => sum + item.comments, 0);
  const saves = records.reduce((sum, item) => sum + item.saves, 0);
  const shares = records.reduce((sum, item) => sum + item.shares, 0);
  const follows = records.reduce((sum, item) => sum + item.follows, 0);
  const profileVisits = records.reduce((sum, item) => sum + item.profile_visits, 0);
  const dms = records.reduce((sum, item) => sum + item.dms, 0);
  const localLeadSignals = records.reduce((sum, item) => sum + item.leads, 0);

  const missed = [
    totalViews < target.total_views ? `total_views short by ${target.total_views - totalViews}` : null,
    avgViews < target.avg_views ? `avg_views short by ${Math.round(target.avg_views - avgViews)}` : null,
    avgRetention < target.avg_retention ? `avg_retention short by ${(target.avg_retention - avgRetention).toFixed(2)}` : null,
    likes < target.likes ? `likes short by ${target.likes - likes}` : null,
    comments < target.comments ? `comments short by ${target.comments - comments}` : null,
    saves < target.saves ? `saves short by ${target.saves - saves}` : null,
    shares < target.shares ? `shares short by ${target.shares - shares}` : null,
    follows < target.follows ? `follows short by ${target.follows - follows}` : null,
    profileVisits < target.profile_visits ? `profile_visits short by ${target.profile_visits - profileVisits}` : null,
    dms < target.dms ? `dms short by ${target.dms - dms}` : null,
    localLeadSignals < target.local_lead_signals ? `local_lead_signals short by ${target.local_lead_signals - localLeadSignals}` : null,
  ].filter(Boolean) as string[];

  const notMet = missed.length > 0;
  const weakest = missed[0] ?? "none";

  return {
    target,
    summary: {
      not_met: notMet,
      weakest_metric: weakest,
      missed_metrics: missed,
      diagnosis:
        avgViews < target.avg_views
          ? "traffic_entry_problem"
          : avgRetention < target.avg_retention
            ? "content_structure_problem"
            : dms < target.dms
              ? "conversion_problem"
              : "healthy",
    },
    root_cause_breakdown: [
      "Hook not specific enough",
      "Opening 3 seconds lack conflict",
      "Subtitle density too high",
      "Insufficient local homeowner cues",
      "CTA too hard or too late",
      "Format repetition in recent 20 posts",
    ],
    correction_plan: {
      reduce: ["generic broad topics", "hard-sell CTA endings"],
      increase: ["before/after verified case clips", "problem-cause-fix structure"],
      switch_hook: ["symptom-first hook", "cost-risk clarity hook"],
      adjust_length: "Shift low-retention clips to 20-35s",
      format_mix: "60% practical FAQ, 25% case, 15% trust/local",
      language_priority: "Prioritize EN audio with selective ZH subtitle for conversion posts",
      pause_low_efficiency_templates: ["overly formal quote explainer template"],
    },
    next_five_day_experiment: [
      "Day1: symptom-first drain clip (test hook A/B)",
      "Day2: real case with before/after (test 25s vs 40s)",
      "Day3: quote education with soft CTA (test comment prompt)",
      "Day4: maintenance reminder (test EN-only vs EN+ZH caption)",
      "Day5: local trust day-on-job clip (test talking head vs b-roll)",
    ],
    score_decay_rule: "If same pillar underperforms for two cycles, auto-lower weight and require new angle before scheduling.",
  };
}
