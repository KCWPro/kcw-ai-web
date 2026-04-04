import assert from "node:assert/strict";
import { toDirectorLead } from "../lib/directorConsole/mockData";

const lead = toDirectorLead({
  id: "t-1",
  customer_name: "Test",
  phone: "123",
  city: "Sacramento",
  service_type: "Leak repair",
  urgency: "high",
  status: "new",
  created_at: new Date().toISOString(),
  customer_notes: "Need urgent check",
  ai_summary: "summary",
  source: "website",
}, 0);

assert.ok(lead.visual_diagnosis.issue_guess.length > 0);
assert.ok(Array.isArray(lead.visual_diagnosis.likely_causes));
assert.ok(lead.engineering_decision.materials.required.length > 0);
assert.ok(lead.estimate.internal_cost.total > 0);

console.log("directorConsoleStructuredOutput.test passed");
