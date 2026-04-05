import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import DirectorDashboardPage from "../app/director/page";
import DirectorWorkspaceView from "../components/director/DirectorWorkspaceView";
import { canTransitionDirectorStatus, getDirectorAllowedTransitions, isDirectorStatus } from "../lib/director/statusMachine";
import { createDirectorCase, getDirectorCaseById, importDirectorCaseFromLead, runDirectorAiAnalysis } from "../lib/director/store";

function run() {
  const requiredRoutes = [
    "app/director/page.tsx",
    "app/director/cases/page.tsx",
    "app/director/cases/new/page.tsx",
    "app/director/cases/[id]/page.tsx",
    "app/director/contracts/page.tsx",
    "app/director/permits/page.tsx",
    "app/director/procurement/page.tsx",
  ];
  requiredRoutes.forEach((routeFile) => {
    assert.equal(fs.existsSync(path.resolve(routeFile)), true, `route missing: ${routeFile}`);
  });

  const dashboardHtml = renderToStaticMarkup(<DirectorDashboardPage />);
  assert.match(dashboardHtml, /Director Console Dashboard/);
  assert.match(dashboardHtml, /New Director Case/);

  const newCaseSource = fs.readFileSync(path.resolve("app/director/cases/new/page.tsx"), "utf8");
  assert.match(newCaseSource, /Manual Case Creation/);
  assert.match(newCaseSource, /New Director Case Builder/);

  const created = createDirectorCase({
    source_type: "manual",
    source_lead_id: null,
    case_title: "Drain Repair - Folsom",
    customer_name: "Director Test",
    phone: "9165551212",
    email: "test@kcw.local",
    service_address: "123 Any St",
    city: "Folsom",
    zip_code: "95630",
    property_type: "single_family",
    residential_or_commercial: "residential",
    urgency_level: "medium",
    job_category: "Drain Repair",
    job_description: "Recurring drain backup",
    scope_notes: "Need camera and cleaning",
    known_symptoms: "slow drains",
    known_constraints: "",
    target_equipment_system: "main drain",
    permit_already_exists: "unknown",
    inspection_expected: "unknown",
    access_difficulty: "moderate",
    house_age_type: "old",
    leak_present: false,
    gas_involved: false,
    drain_involved: true,
    water_heater_involved: false,
    repipe_related: false,
    commercial_fixture_related: false,
    operator_notes: "manual flow test",
    plan_sketch_refs: "none",
  });

  assert.ok(created.case_record.case_id.startsWith("DIR-"));
  assert.ok(getDirectorCaseById(created.case_record.case_id));

  const analyzed = runDirectorAiAnalysis(created.case_record.case_id);
  assert.ok(analyzed);
  assert.ok(analyzed?.visual_diagnosis);

  const workspaceHtml = renderToStaticMarkup(<DirectorWorkspaceView bundle={analyzed!} disableActions />);
  [
    "Visual Diagnosis",
    "Engineering Decision",
    "Materials",
    "Estimate Builder",
    "Contract Builder",
    "Permit Review",
    "Procurement Suggestions",
    "Admin Workflow",
    "available/placeholder tag",
  ].forEach((label) => assert.match(workspaceHtml, new RegExp(label)));

  const imported = importDirectorCaseFromLead("lead-1001");
  assert.ok(imported);
  assert.equal(imported?.case_record.source_type, "imported_lead");

  assert.equal(isDirectorStatus("draft"), true);
  assert.equal(isDirectorStatus("not_real_status"), false);
  assert.equal(canTransitionDirectorStatus("draft", "intake_ready"), true);
  assert.equal(canTransitionDirectorStatus("draft", "completed"), false);
  assert.ok(getDirectorAllowedTransitions("estimate_ready").includes("contract_ready"));

  console.log("Director Console v1 tests passed.");
}

run();
