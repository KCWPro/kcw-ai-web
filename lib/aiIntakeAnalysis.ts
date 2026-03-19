import { StoredLead } from "@/lib/internalLeadsStore";

export type IssueClassification = "plumbing" | "inspection" | "installation" | "unknown";

export type InfoCompletenessLevel = "sufficient" | "partial" | "insufficient";

export type SuggestedPriceRange = {
  min: number | null;
  max: number | null;
  currency: "USD";
  notes: string;
};

export type IntakeAnalysisResult = {
  issue_classification: IssueClassification;
  info_completeness: InfoCompletenessLevel;
  missing_fields: Array<"phone" | "city" | "service_type" | "customer_notes" | "property_type" | "problem_duration">;
  recommended_action: string;
  suggested_price_range: SuggestedPriceRange;
  next_step: string;
  confidence: number;
  analysis_version: "phase2-step1";
};

type AnalysisLeadInput = Pick<
  StoredLead,
  "service_type" | "urgency" | "customer_notes" | "problem_duration" | "property_type" | "phone" | "city"
>;

function containsAny(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function classifyIssue(lead: AnalysisLeadInput): IssueClassification {
  const text = `${lead.service_type} ${lead.customer_notes}`.toLowerCase();

  if (containsAny(text, ["inspection", "camera", "diagnostic", "check", "assessment"])) {
    return "inspection";
  }

  if (containsAny(text, ["install", "replacement", "replace", "reroute", "new unit"])) {
    return "installation";
  }

  if (containsAny(text, ["leak", "drain", "pipe", "sewer", "water heater", "clog", "plumb"])) {
    return "plumbing";
  }

  return "unknown";
}

function buildMissingFields(lead: AnalysisLeadInput): IntakeAnalysisResult["missing_fields"] {
  const missing: IntakeAnalysisResult["missing_fields"] = [];

  if (!lead.phone?.trim()) missing.push("phone");
  if (!lead.city?.trim()) missing.push("city");
  if (!lead.service_type?.trim()) missing.push("service_type");
  if (!lead.customer_notes?.trim()) missing.push("customer_notes");
  if (!lead.property_type?.trim()) missing.push("property_type");
  if (!lead.problem_duration?.trim()) missing.push("problem_duration");

  return missing;
}

function calculateCompleteness(missingFields: IntakeAnalysisResult["missing_fields"]): InfoCompletenessLevel {
  if (missingFields.length <= 1) {
    return "sufficient";
  }

  if (missingFields.length <= 3) {
    return "partial";
  }

  return "insufficient";
}

function buildSuggestedPriceRange(lead: AnalysisLeadInput, issue: IssueClassification): SuggestedPriceRange {
  if (lead.urgency === "high") {
    return { min: 250, max: 1200, currency: "USD", notes: "High urgency placeholder range" };
  }

  if (issue === "inspection") {
    return { min: 89, max: 350, currency: "USD", notes: "Inspection-focused placeholder range" };
  }

  if (issue === "installation") {
    return { min: 450, max: 3500, currency: "USD", notes: "Installation placeholder range" };
  }

  if (issue === "plumbing") {
    return { min: 180, max: 1500, currency: "USD", notes: "General plumbing placeholder range" };
  }

  return { min: null, max: null, currency: "USD", notes: "Insufficient data for placeholder range" };
}

export function buildIntakeAnalysis(lead: AnalysisLeadInput): IntakeAnalysisResult {
  const issueClassification = classifyIssue(lead);
  const missingFields = buildMissingFields(lead);
  const infoCompleteness = calculateCompleteness(missingFields);

  const recommendedAction =
    lead.urgency === "high"
      ? "Call customer immediately and prioritize same-day dispatch validation."
      : infoCompleteness === "insufficient"
        ? "Collect missing intake details before quoting."
        : "Proceed with internal triage and estimate preparation.";

  const nextStep =
    infoCompleteness === "insufficient"
      ? "Request missing phone/city/service details and confirm property context."
      : issueClassification === "inspection"
        ? "Offer an inspection time window and confirm expected deliverable."
        : "Assign operations owner for follow-up and scheduling.";

  const confidence = Math.max(0.25, Math.min(0.95, 0.9 - missingFields.length * 0.1));

  return {
    issue_classification: issueClassification,
    info_completeness: infoCompleteness,
    missing_fields: missingFields,
    recommended_action: recommendedAction,
    suggested_price_range: buildSuggestedPriceRange(lead, issueClassification),
    next_step: nextStep,
    confidence,
    analysis_version: "phase2-step1",
  };
}
