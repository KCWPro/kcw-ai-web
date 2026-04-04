import assert from "node:assert/strict";
import { applyReviewAction } from "../lib/contentOps/reviewWorkflow";
import { createAssetFromUpload } from "../lib/contentOps/assetLibrary";
import { summarizeExecutionProgress } from "../lib/contentOps/operationsExecution";
import { detectDuplicationRisk } from "../lib/contentOps/duplicationGuard";
import { applyMonetizationOverride, buildMonetizationExecutionMap } from "../lib/contentOps/monetizationPlanner";
import { importPerformanceFromCsv } from "../lib/contentOps/performanceImport";
import { importedPerformanceCsv } from "../data/contentOps/importedPerformance";

function run() {
  const review = applyReviewAction({
    entity: "script",
    id: "script_sample_1",
    action: "approve",
    reviewer_notes: "Ready to publish.",
    updated_by: "test_runner",
  });
  assert.equal(review.success, true);
  assert.ok(review.review_funnel.approved >= 1);

  const asset = createAssetFromUpload({
    filename: "demo.mp4",
    mime_type: "video/mp4",
    file_size_bytes: 100,
    preview_url: "/demo",
    tags: ["before-after", "B-roll"],
    safe_for_public: true,
    talking_head_compatible: true,
  });
  assert.equal(asset.safe_for_public, true);
  assert.equal(asset.talking_head_compatible, true);

  const execution = summarizeExecutionProgress([
    { date: "2026-03-27", status: "planned", comment_replied: false, dm_processed: false, high_intent_lead_handoff: false },
    { date: "2026-03-27", status: "reviewed", comment_replied: true, dm_processed: true, high_intent_lead_handoff: true },
  ]);
  assert.equal(execution.total, 2);
  assert.equal(execution.completed, 1);
  assert.equal(execution.incomplete, 1);

  const imported = importPerformanceFromCsv(importedPerformanceCsv);
  const strictDup = detectDuplicationRisk(imported.records, { threshold: 0.4, groupByLanguage: true, groupByPlatform: true });
  const looseDup = detectDuplicationRisk(imported.records, { threshold: 0.95, groupByLanguage: false, groupByPlatform: false });
  assert.ok(strictDup.blocked.length >= looseDup.blocked.length);

  const monetization = buildMonetizationExecutionMap(imported.records.slice(0, 2));
  const overridden = applyMonetizationOverride(monetization, { [monetization[0].post_id]: "education_only" });
  assert.equal(overridden[0].primary_label, "education_only");

  const badCsv = "post_id,platform\na,b";
  const validation = importPerformanceFromCsv(badCsv);
  assert.ok(validation.errors.length > 0);
}

run();
console.log("contentOpsV1Regression.test passed");
