import assert from 'node:assert/strict';
import { createDirectorCase, getDirectorCaseById, listDirectorCases } from '../lib/directorCasesStore';
import { DIRECTOR_WORKSPACE_SECTION_TITLES } from '../lib/directorWorkspace';

function runDirectorConsoleFlowTest() {
  const created = createDirectorCase({
    title: 'Test Director Flow Workspace',
    clientName: 'QA Client',
    address: 'Monterey Park, CA',
    scopeSummary: 'Validate director create -> redirect -> workspace chain.',
  });

  assert.ok(created.id.startsWith('dc_'), 'expected generated director case id');
  assert.equal(created.status, 'active');

  const redirectUrl = `/director/cases/${created.id}`;
  assert.ok(redirectUrl.includes(created.id), 'redirect URL should contain case id');

  const stored = getDirectorCaseById(created.id);
  assert.ok(stored, 'case should be persisted to director data layer');
  assert.equal(stored?.title, 'Test Director Flow Workspace');

  const inbox = listDirectorCases();
  assert.ok(inbox.some((item) => item.id === created.id), 'inbox should include created case');

  const requiredModules = ['Engineering', 'Materials', 'Estimate', 'Contract', 'Permit', 'Procurement'];
  for (const module of requiredModules) {
    assert.ok(DIRECTOR_WORKSPACE_SECTION_TITLES.includes(module as (typeof DIRECTOR_WORKSPACE_SECTION_TITLES)[number]));
  }
}

runDirectorConsoleFlowTest();
console.log('directorConsoleFlow.test.ts: pass');
