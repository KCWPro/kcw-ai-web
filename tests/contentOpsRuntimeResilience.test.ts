import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildPerformanceSnapshot } from "../lib/contentOps";
import { readContentOpsState } from "../lib/contentOps/contentOpsStore";

const storePath = path.join(process.cwd(), "data", "contentOps", "runtime", "content-ops-store.json");
function run() {
  const storeBackup = fs.existsSync(storePath) ? fs.readFileSync(storePath, "utf-8") : "";

  try {
    fs.writeFileSync(storePath, "", "utf-8");
    const emptyRecovered = readContentOpsState();
    assert.ok(Array.isArray(emptyRecovered.scripts));
    assert.ok(Array.isArray(emptyRecovered.executionTasks));

    fs.writeFileSync(
      storePath,
      JSON.stringify({ scripts: [{ id: "legacy_only" }], postPlans: [], importMeta: { currentSource: "default_seed", lastImportedAt: "", cycleQualified: false } }),
      "utf-8",
    );

    const snapshot = buildPerformanceSnapshot();
    assert.ok(Array.isArray(snapshot.executionBoard));
    assert.ok(Array.isArray(snapshot.assetLibrary.records));
    assert.ok(Array.isArray(snapshot.importSummary.errors));
    assert.doesNotThrow(() => JSON.stringify(snapshot));
  } finally {
    if (storeBackup) {
      fs.writeFileSync(storePath, storeBackup, "utf-8");
    }
  }
}

run();
console.log("contentOpsRuntimeResilience.test passed");
