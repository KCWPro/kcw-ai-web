import { scriptSamples } from "@/data/contentOps/scriptSamples";
import { scriptTemplates } from "@/data/contentOps/scriptTemplates";
import { seedTopics, seedTopicCount } from "@/data/contentOps/seedTopics";
import { runFiveDayReview } from "@/lib/contentOps/fiveDayReview";
import { buildMonetizationPlanner } from "@/lib/contentOps/monetizationPlanner";
import { analyzePerformance } from "@/lib/contentOps/performanceTracker";
import { buildPublishingChecklist } from "@/lib/contentOps/publishingChecklist";
import { generateScriptPack } from "@/lib/contentOps/scriptGenerator";
import { buildContentStrategyEngine } from "@/lib/contentOps/strategyEngine";
import { pickTopThreeForToday } from "@/lib/contentOps/topicGenerator";
import type { PerformanceRecord } from "@/lib/contentOps/types";

export const contentOpsSeeds = {
  topics: seedTopics,
  topicCount: seedTopicCount,
  scriptSamples,
  scriptTemplates,
};

export function buildDailyPlannerSnapshot() {
  const strategy = buildContentStrategyEngine();
  const topThree = pickTopThreeForToday(seedTopics);
  const scripts = topThree.map((entry) => generateScriptPack(entry.topic));
  const checklists = topThree.map((entry, index) => ({ topicId: entry.topic.id, checklist: buildPublishingChecklist(entry.topic, scripts[index]) }));

  return {
    strategy,
    topThree,
    scripts,
    checklists,
  };
}

export function buildPerformanceSnapshot() {
  const mockPerformance: PerformanceRecord[] = [
    {
      post_id: "p1",
      platform: "tiktok",
      posted_at: "2026-03-22T18:00:00Z",
      views: 2300,
      retention: 0.33,
      likes: 120,
      comments: 18,
      saves: 14,
      shares: 8,
      follows: 9,
      profile_visits: 44,
      dms: 4,
      leads: 2,
      topic_type: "faq",
      format_type: "faq_quick_answer",
      language: "en",
      posting_time: "18:00",
      analysis_summary: "solid",
      cycle_id: "cycle_2026_03_5d_1",
      goal_met: true,
      missed_metrics: [],
      root_causes: [],
      optimization_actions: [],
      next_cycle_strategy: "repeat",
    },
    {
      post_id: "p2",
      platform: "instagram_reels",
      posted_at: "2026-03-23T18:00:00Z",
      views: 1200,
      retention: 0.21,
      likes: 52,
      comments: 8,
      saves: 5,
      shares: 3,
      follows: 3,
      profile_visits: 18,
      dms: 2,
      leads: 1,
      topic_type: "education",
      format_type: "quote_education",
      language: "en_audio_zh_sub",
      posting_time: "18:00",
      analysis_summary: "mixed",
      cycle_id: "cycle_2026_03_5d_1",
      goal_met: false,
      missed_metrics: ["retention"],
      root_causes: ["hook weak"],
      optimization_actions: ["shorter edit"],
      next_cycle_strategy: "test",
    },
  ];

  return {
    performanceAnalysis: analyzePerformance([...mockPerformance]),
    fiveDayReview: runFiveDayReview([...mockPerformance], "standard"),
    monetization: buildMonetizationPlanner([...mockPerformance]),
  };
}
