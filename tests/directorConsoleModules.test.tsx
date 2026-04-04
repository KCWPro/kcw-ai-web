import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import DirectorConsoleModules from "../app/internal/leads/[id]/DirectorConsoleModules";
import type { StoredLead } from "../lib/internalLeadsStore";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";

const leadFixture: StoredLead = {
  id: "lead-1001",
  created_at: "2026-03-17 08:15",
  status: "follow_up",
  customer_name: "Michael Torres",
  phone: "(916) 555-0182",
  city: "Sacramento",
  service_type: "Emergency leak repair",
  urgency: "high",
  property_type: "",
  source: "website",
  quote_amount: "",
  problem_duration: "",
  customer_notes: "Active leak under kitchen sink.",
  ai_summary: "High urgency leak risk.",
  internal_notes: "",
  last_updated_at: "2026-03-17 08:30",
};

const analysisFixture: IntakeAnalysisResult = {
  issue_classification: "water_leak",
  info_completeness: "partial",
  missing_fields: ["property_type", "problem_duration"],
  recommended_action: "Priority callback and dispatch prep.",
  suggested_price_range: {
    band: "likely_medium_job",
    min: 250,
    max: 1600,
    currency: "USD",
    notes: "placeholder",
  },
  next_step: "Confirm access and dispatch window.",
  confidence: 0.78,
  analysis_version: "phase2-step3-rules",
};

function run() {
  const withAnalysisHtml = renderToStaticMarkup(<DirectorConsoleModules lead={leadFixture} analysis={analysisFixture} />);
  assert.match(withAnalysisHtml, /Visual Diagnosis/);
  assert.match(withAnalysisHtml, /Contract Builder/);
  assert.match(withAnalysisHtml, /Permit Review/);
  assert.match(withAnalysisHtml, /Procurement Suggestions/);
  assert.match(withAnalysisHtml, /Available/);
  assert.match(withAnalysisHtml, /Placeholder/);
  assert.match(withAnalysisHtml, /Priority callback and dispatch prep\./);

  const noAnalysisHtml = renderToStaticMarkup(<DirectorConsoleModules lead={leadFixture} analysis={null} />);
  assert.match(noAnalysisHtml, /Waiting for AI intake analysis output\./);
  assert.match(noAnalysisHtml, /Placeholder: no permit packet generator in v1\./);

  console.log("directorConsoleModules tests passed");
}

run();
