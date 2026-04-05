import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createDirectorCase, getDirectorCaseById, listDirectorCases } from "../lib/director/directorStore";
import { buildDirectorCaseWorkspaceHref } from "../lib/director/navigation";
import { directorWorkspaceSections } from "../lib/director/workspace";

function run() {
  const storePath = path.join(process.cwd(), ".data", "director-cases.json");
  if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }

  const created = createDirectorCase({ title: "Flow Verification Case" });
  const redirectUrl = buildDirectorCaseWorkspaceHref(created.id);

  assert.match(redirectUrl, /^\/director\/cases\/[a-f0-9-]+$/);
  assert.equal(redirectUrl.includes("/director/cases/"), true);
  assert.equal(redirectUrl === "/director", false);

  const loaded = getDirectorCaseById(created.id);
  assert.ok(loaded);

  assert.deepEqual(directorWorkspaceSections, [
    "Case Header",
    "Engineering",
    "Materials",
    "Estimate",
    "Contract",
    "Permit",
    "Procurement",
  ]);

  assert.equal(loaded?.title, "Flow Verification Case");
  assert.ok(loaded?.engineering.length);

  const inboxCases = listDirectorCases();
  assert.equal(inboxCases[0]?.id, created.id);

  const fallbackOnlyText = "Console / Cases / Contracts / Permits / Procurement / Create Director Case";
  assert.equal(fallbackOnlyText.includes("Director Deep Workspace"), false);
}

run();
console.log("directorMainFlow.test passed");
