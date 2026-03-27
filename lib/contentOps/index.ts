import { scriptSamples } from "@/data/contentOps/scriptSamples";
import { scriptTemplates } from "@/data/contentOps/scriptTemplates";
import { seedTopics, seedTopicCount } from "@/data/contentOps/seedTopics";
import { findAssetGaps, filterAssets, seedAssets } from "@/lib/contentOps/assetLibrary";
import { listAssetsWithUploads } from "@/lib/contentOps/assetUploadStore";
import { buildDashboardTopAlert } from "@/lib/contentOps/dashboardAlerts";
import { detectDuplicationRisk } from "@/lib/contentOps/duplicationGuard";
import { runFiveDayReview } from "@/lib/contentOps/fiveDayReview";
import { applyMonetizationOverride, buildMonetizationExecutionMap, buildMonetizationPlanner } from "@/lib/contentOps/monetizationPlanner";
import { buildDailyExecutionBoard, buildExecutionBoardFromTasks, seedPostPlans, summarizeExecutionProgress } from "@/lib/contentOps/operationsExecution";
import { importPerformanceFromCsv, importPerformanceFromSheetText, loadDefaultPerformanceRecords } from "@/lib/contentOps/performanceImport";
import { analyzePerformance } from "@/lib/contentOps/performanceTracker";
import { buildPublishingChecklist } from "@/lib/contentOps/publishingChecklist";
import { generateScriptPack } from "@/lib/contentOps/scriptGenerator";
import { buildScriptStudioDraft } from "@/lib/contentOps/scriptStudio";
import { buildContentStrategyEngine } from "@/lib/contentOps/strategyEngine";
import { pickTopThreeForToday } from "@/lib/contentOps/topicGenerator";
import type { PerformanceRecord } from "@/lib/contentOps/types";
import { buildInteractionBacklogSummary, groupDmReplyByInquiryType, groupReplyBankByContentType } from "@/lib/contentOps/interactionStudio";
import { readContentOpsState } from "@/lib/contentOps/contentOpsStore";

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
  const warnings: string[] = [];
  const runtime = readContentOpsState();
  const imported = importInput?.csvText
    ? importPerformanceFromCsv(importInput.csvText)
    : importInput?.sheetText
      ? importPerformanceFromSheetText(importInput.sheetText)
      : loadDefaultPerformanceRecords();

  const records: PerformanceRecord[] = Array.isArray(imported.records) ? imported.records : [];
  const fiveDayReview = runFiveDayReview(records, "standard");
  const monetization = buildMonetizationPlanner(records);
  const scriptStudioBase = runtime.scripts.find((script) => script && Array.isArray(script.hook_variants) && typeof script.standard_script === "string") ?? scriptSamples[0];
  if (!runtime.scripts.find((script) => script && Array.isArray(script.hook_variants) && typeof script.standard_script === "string")) {
    warnings.push("Script store contained legacy or invalid data; using seed script fallback.");
  }
  const scriptStudioPreview = buildScriptStudioDraft(scriptStudioBase, "en", 0);
  const cycleId = records[records.length - 1]?.cycle_id ?? "cycle_unknown";
  const executionTasks = Array.isArray(runtime.executionTasks) ? runtime.executionTasks : [];
  const executionBoard = executionTasks.length > 0 ? buildExecutionBoardFromTasks(executionTasks) : buildDailyExecutionBoard(seedPostPlans);
  const executionProgress = summarizeExecutionProgress(executionBoard);
  const monetizationExecution = applyMonetizationOverride(buildMonetizationExecutionMap(records), runtime.monetizationOverrides ?? {});
  const mergedAssets = listAssetsWithUploads();
  const scripts = Array.isArray(runtime.scripts) ? runtime.scripts : [];
  const postPlans = Array.isArray(runtime.postPlans) ? runtime.postPlans : [];
  const interactions = Array.isArray(runtime.interactions) ? runtime.interactions : [];
  const reviewFunnel = {
    draft: scripts.filter((s) => s.review_status === "draft").length + postPlans.filter((p) => p.review_status === "draft").length,
    reviewed: scripts.filter((s) => s.review_status === "reviewed").length + postPlans.filter((p) => p.review_status === "reviewed").length,
    approved: scripts.filter((s) => s.review_status === "approved").length + postPlans.filter((p) => p.review_status === "approved").length,
    rejected: scripts.filter((s) => s.review_status === "rejected").length + postPlans.filter((p) => p.review_status === "rejected").length,
  };
  const interactionBacklog = buildInteractionBacklogSummary(interactions);

  return {
    importSummary: {
      source: imported.source,
      count: records.length,
      errors: [...(Array.isArray(imported.errors) ? imported.errors : []), ...warnings],
      sheetAdapter: imported.sheetAdapter,
      currentSource: runtime.importMeta.currentSource,
      lastImportedAt: runtime.importMeta.lastImportedAt,
      cycleQualified: runtime.importMeta.cycleQualified,
      sheetConfig: runtime.sheetConfig,
    },
    performanceRecords: records,
    performanceAnalysis: analyzePerformance(records),
    fiveDayReview,
    monetization,
    scriptStudioBase,
    scriptStudioPreview,
    postPlans,
    reviewFunnel,
    assetLibrary: {
      records: mergedAssets,
      missing: findAssetGaps(mergedAssets),
      publicBeforeAfter: filterAssets(mergedAssets, { safeForPublic: true, beforeAfter: true }).length,
    },
    executionBoard,
    executionProgress,
    monetizationExecution,
    duplication: detectDuplicationRisk(records, runtime.duplicationSettings),
    duplicationSettings: runtime.duplicationSettings,
    interactions,
    interactionBacklog,
    interactionReplyGroups: groupReplyBankByContentType(),
    dmReplyGroups: groupDmReplyByInquiryType(),
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
