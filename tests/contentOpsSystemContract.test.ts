import assert from "node:assert/strict";
import { seedTopicCount, seedTopics } from "../data/contentOps/seedTopics";
import { scriptSamples } from "../data/contentOps/scriptSamples";
import { scriptTemplates } from "../data/contentOps/scriptTemplates";
import { runFiveDayReview } from "../lib/contentOps/fiveDayReview";
import { buildMonetizationPlanner } from "../lib/contentOps/monetizationPlanner";
import { importPerformanceFromCsv, importPerformanceFromSheetText, loadDefaultPerformanceRecords } from "../lib/contentOps/performanceImport";
import { detectDuplicationRisk } from "../lib/contentOps/duplicationGuard";
import { buildDashboardTopAlert } from "../lib/contentOps/dashboardAlerts";

function run() {
  assert.ok(seedTopicCount >= 100, "seed topics should be at least 100");
  assert.equal(seedTopics.length, seedTopicCount, "seed topic count should match exported count");
  assert.ok(scriptSamples.length >= 20, "script samples should be at least 20");
  assert.ok(scriptTemplates.length >= 30, "script templates should be at least 30");

  const defaultImport = loadDefaultPerformanceRecords();
  assert.ok(defaultImport.records.length >= 20, "default imported performance should provide at least 20 posts");

  const review = runFiveDayReview(defaultImport.records, "standard");
  assert.ok(typeof review.summary.not_met === "boolean");
  assert.ok(Array.isArray(review.root_cause_breakdown));
  assert.ok(review.next_five_day_experiment.length === 5);

  const monetization = buildMonetizationPlanner(defaultImport.records);
  assert.ok(monetization.ordering_rule.includes("local lead conversion"));

  const csvPreview = `post_id,platform,posted_at,views,retention,likes,comments,saves,shares,follows,profile_visits,dms,leads,topic_type,format_type,language,posting_time,analysis_summary,cycle_id,goal_met,title,hook,script_expression,structure_signature\nr1,tiktok,2026-03-26T18:00:00Z,1000,0.3,50,8,5,4,3,12,1,1,faq,faq_quick_answer,en,18:00,mixed,cycle_x,true,t,h,s,st`;
  const csvImported = importPerformanceFromCsv(csvPreview);
  assert.equal(csvImported.records.length, 1, "csv import should parse one row");

  const sheetPreview = csvPreview.replaceAll(",", "\t");
  const sheetImported = importPerformanceFromSheetText(sheetPreview);
  assert.equal(sheetImported.records.length, 1, "sheet import should parse one row");

  const duplication = detectDuplicationRisk(defaultImport.records);
  assert.equal(duplication.windowSize, 20, "duplication should run against recent 20 records");
  assert.ok(Array.isArray(duplication.blocked));

  const alert = buildDashboardTopAlert({
    cycleId: "cycle_x",
    review: review.summary,
    monetizationStage: monetization.stage,
  });
  assert.ok(alert.cycleStatus.includes("cycle_x"));
}

run();
console.log("contentOpsSystemContract.test passed");
