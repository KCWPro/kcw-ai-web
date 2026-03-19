import assert from "node:assert/strict";
import { buildIntakeAnalysis, type IssueClassification } from "../lib/aiIntakeAnalysis";

type Case = {
  name: string;
  lead: {
    service_type: string;
    urgency: string;
    customer_notes: string;
    problem_duration: string;
    property_type: string;
    phone: string;
    city: string;
  };
  expectedClassification?: IssueClassification;
  expectedCompleteness?: "sufficient" | "partial" | "insufficient";
  mustIncludeMissing?: string[];
};

const cases: Case[] = [
  {
    name: "water heater complete lead",
    lead: {
      service_type: "Water heater replacement",
      urgency: "medium",
      customer_notes:
        "Current tank is leaking from bottom and hot water is unstable for two days. Needs replacement options.",
      problem_duration: "2 days",
      property_type: "single_family",
      phone: "9165550101",
      city: "Sacramento",
    },
    expectedClassification: "water_heater",
    expectedCompleteness: "sufficient",
  },
  {
    name: "drain issue with partial info",
    lead: {
      service_type: "Drain cleaning",
      urgency: "medium",
      customer_notes: "Kitchen sink slow drain and backup smell.",
      problem_duration: "",
      property_type: "",
      phone: "7075550101",
      city: "Vacaville",
    },
    expectedClassification: "drain_issue",
    expectedCompleteness: "partial",
    mustIncludeMissing: ["property_type", "problem_duration"],
  },
  {
    name: "insufficient intake",
    lead: {
      service_type: "",
      urgency: "",
      customer_notes: "help",
      problem_duration: "",
      property_type: "",
      phone: "",
      city: "",
    },
    expectedClassification: "unknown",
    expectedCompleteness: "insufficient",
    mustIncludeMissing: ["phone", "city", "service_type", "customer_notes", "urgency"],
  },
  {
    name: "repipe requires site visit",
    lead: {
      service_type: "Whole home repipe consultation",
      urgency: "low",
      customer_notes: "Old galvanized lines, wants whole-home repipe planning for remodel.",
      problem_duration: "6 months",
      property_type: "duplex",
      phone: "5105550123",
      city: "Folsom",
    },
    expectedClassification: "repipe",
    expectedCompleteness: "sufficient",
  },
  {
    name: "high urgency leak",
    lead: {
      service_type: "Emergency slab leak",
      urgency: "high",
      customer_notes: "Water pooling near hallway floor and pressure dropped suddenly, active leak suspected.",
      problem_duration: "today",
      property_type: "single_family",
      phone: "9255550111",
      city: "Elk Grove",
    },
    expectedClassification: "water_leak",
    expectedCompleteness: "sufficient",
  },
];

for (const testCase of cases) {
  const result = buildIntakeAnalysis(testCase.lead);

  assert.ok(result.issue_classification);
  assert.ok(result.recommended_action.length > 0);
  assert.ok(result.next_step.length > 0);
  assert.equal(result.analysis_version, "phase2-step2");

  if (testCase.expectedClassification) {
    assert.equal(result.issue_classification, testCase.expectedClassification, `${testCase.name} classification mismatch`);
  }

  if (testCase.expectedCompleteness) {
    assert.equal(result.info_completeness, testCase.expectedCompleteness, `${testCase.name} completeness mismatch`);
  }

  for (const requiredMissing of testCase.mustIncludeMissing || []) {
    assert.ok(result.missing_fields.includes(requiredMissing as never), `${testCase.name} missing field ${requiredMissing}`);
  }

  if (testCase.lead.urgency === "high") {
    assert.match(result.recommended_action.toLowerCase(), /priority|call/);
  }

  if (result.info_completeness === "insufficient") {
    assert.equal(result.suggested_price_range.band, "insufficient_information");
  }
}

console.log(`aiIntakeAnalysis tests passed: ${cases.length} cases`);
