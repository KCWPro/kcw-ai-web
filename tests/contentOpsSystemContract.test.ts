import assert from "node:assert/strict";
import { seedTopicCount, seedTopics } from "../data/contentOps/seedTopics";
import { scriptSamples } from "../data/contentOps/scriptSamples";
import { scriptTemplates } from "../data/contentOps/scriptTemplates";
import { runFiveDayReview } from "../lib/contentOps/fiveDayReview";
import { buildMonetizationPlanner } from "../lib/contentOps/monetizationPlanner";

function run() {
  assert.ok(seedTopicCount >= 100, "seed topics should be at least 100");
  assert.equal(seedTopics.length, seedTopicCount, "seed topic count should match exported count");
  assert.ok(scriptSamples.length >= 20, "script samples should be at least 20");
  assert.ok(scriptTemplates.length >= 30, "script templates should be at least 30");

  const review = runFiveDayReview([], "standard");
  assert.ok(typeof review.summary.not_met === "boolean");
  assert.ok(Array.isArray(review.root_cause_breakdown));
  assert.ok(review.next_five_day_experiment.length === 5);

  const monetization = buildMonetizationPlanner([]);
  assert.ok(monetization.ordering_rule.includes("local lead conversion"));
}

run();
console.log("contentOpsSystemContract.test passed");
