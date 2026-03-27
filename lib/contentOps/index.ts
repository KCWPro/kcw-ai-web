import { scriptSamples } from "@/data/contentOps/scriptSamples";
import { scriptTemplates } from "@/data/contentOps/scriptTemplates";
import { seedTopics, seedTopicCount } from "@/data/contentOps/seedTopics";
import { findAssetGaps, filterAssets, seedAssets } from "@/lib/contentOps/assetLibrary";
import { buildDashboardTopAlert } from "@/lib/contentOps/dashboardAlerts";
import { detectDuplicationRisk } from "@/lib/contentOps/duplicationGuard";
import { runFiveDayReview } from "@/lib/contentOps/fiveDayReview";
import { buildMonetizationPlanner } from "@/lib/contentOps/monetizationPlanner";
import { buildMonetizationExecutionMap } from "@/lib/contentOps/monetizationPlanner";
import { buildDailyExecutionBoard, seedPostPlans, summarizeExecutionProgress } from "@/lib/contentOps/operationsExecution";
import { importPerformanceFromCsv, importPerformanceFromSheetText, loadDefaultPerformanceRecords } from "@/lib/contentOps/performanceImport";
import { analyzePerformance } from "@/lib/contentOps/performanceTracker";
import { buildPublishingChecklist } from "@/lib/contentOps/publishingChecklist";
import { generateScriptPack } from "@/lib/contentOps/scriptGenerator";
import { buildScriptStudioDraft } from "@/lib/contentOps/scriptStudio";
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

export function buildPerformanceSnapshot(importInput?: { csvText?: string; sheetText?: string }) {
  const imported = importInput?.csvText
    ? importPerformanceFromCsv(importInput.csvText)
    : importInput?.sheetText
      ? importPerformanceFromSheetText(importInput.sheetText)
      : loadDefaultPerformanceRecords();

  const records: PerformanceRecord[] = imported.records;
  const fiveDayReview = runFiveDayReview(records, "standard");
  const monetization = buildMonetizationPlanner(records);
  const scriptStudioBase = scriptSamples[0];
  const scriptStudioPreview = buildScriptStudioDraft(scriptStudioBase, "en", 0);
  const cycleId = records[records.length - 1]?.cycle_id ?? "cycle_unknown";
  const executionBoard = buildDailyExecutionBoard(seedPostPlans);
  const executionProgress = summarizeExecutionProgress(executionBoard);
  const monetizationExecution = buildMonetizationExecutionMap(records);

  return {
    importSummary: {
      source: imported.source,
      count: records.length,
      errors: imported.errors,
      sheetAdapter: imported.sheetAdapter,
    },
    performanceRecords: records,
    performanceAnalysis: analyzePerformance(records),
    fiveDayReview,
    monetization,
    scriptStudioBase,
    scriptStudioPreview,
    postPlans: seedPostPlans,
    assetLibrary: {
      records: seedAssets,
      missing: findAssetGaps(seedAssets),
      publicBeforeAfter: filterAssets(seedAssets, { safeForPublic: true, beforeAfter: true }).length,
    },
    executionBoard,
    executionProgress,
    monetizationExecution,
    duplication: detectDuplicationRisk(records),
    dashboardAlert: buildDashboardTopAlert({
      cycleId,
      review: fiveDayReview.summary,
      monetizationStage: monetization.stage,
      executionProgress: {
        total: executionProgress.total,
        posted: executionProgress.stageCount.posted,
      },
    }),
  };
}
