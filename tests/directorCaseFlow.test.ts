import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

async function run() {
  const tempFile = path.join(os.tmpdir(), `director-cases-${Date.now()}-${Math.random()}.json`);
  process.env.DIRECTOR_CASES_FILE_PATH = tempFile;

  const { createDirectorCase, getDirectorCaseById, listDirectorCases } = await import("../lib/director/casesStore");
  const { getDirectorCaseWorkspacePath, normalizeCreatedDirectorCase } = await import("../lib/director/caseContract");

  const created = await createDirectorCase({ title: "Director incident smoke test", summary: "Validate case creation path" });
  assert.ok(created.id.startsWith("dcase_"));

  const normalized = normalizeCreatedDirectorCase({ case_id: created.id, title: created.title });
  assert.equal(normalized.id, created.id);

  const workspacePath = getDirectorCaseWorkspacePath(normalized.id);
  assert.equal(workspacePath, `/director/cases/${created.id}`);

  const hydrated = await getDirectorCaseById(created.id);
  assert.ok(hydrated);
  assert.equal(hydrated?.title, created.title);

  const inbox = await listDirectorCases();
  assert.ok(inbox.some((item) => item.id === created.id));

  const raw = JSON.parse(await fs.readFile(tempFile, "utf8"));
  assert.ok(Array.isArray(raw));
  assert.ok(raw.length >= 1);

  await fs.unlink(tempFile).catch(() => undefined);
}

run()
  .then(() => {
    console.log("directorCaseFlow.test passed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
