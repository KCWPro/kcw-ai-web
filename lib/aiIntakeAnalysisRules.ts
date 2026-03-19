import type { StoredLead } from "./internalLeadsStore";

export type IssueClassification =
  | "drain_issue"
  | "water_leak"
  | "water_heater"
  | "repipe"
  | "sewer_issue"
  | "gas_line"
  | "fixture_installation"
  | "inspection_or_diagnosis"
  | "general_plumbing"
  | "unknown";

export type InfoCompletenessLevel = "sufficient" | "partial" | "insufficient";

export type SuggestedPriceBand =
  | "inspection_only"
  | "likely_small_job"
  | "likely_medium_job"
  | "likely_large_job"
  | "requires_site_visit"
  | "insufficient_information";

export type SuggestedPriceRange = {
  band: SuggestedPriceBand;
  min: number | null;
  max: number | null;
  currency: "USD";
  notes: string;
};

export type IntakeAnalysisResult = {
  issue_classification: IssueClassification;
  info_completeness: InfoCompletenessLevel;
  missing_fields: Array<"phone" | "city" | "service_type" | "customer_notes" | "property_type" | "problem_duration" | "urgency">;
  recommended_action: string;
  suggested_price_range: SuggestedPriceRange;
  next_step: string;
  confidence: number;
  analysis_version: string;
};

export type AnalysisLeadInput = Pick<
  StoredLead,
  "service_type" | "urgency" | "customer_notes" | "problem_duration" | "property_type" | "phone" | "city"
>;

type FieldQuality = {
  hasServiceType: boolean;
  hasUrgency: boolean;
  hasPhone: boolean;
  hasCity: boolean;
  hasPropertyType: boolean;
  hasProblemDuration: boolean;
  notesRichEnough: boolean;
};

function normalizeText(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

function containsAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function classifyIssue(lead: AnalysisLeadInput): IssueClassification {
  const serviceType = normalizeText(lead.service_type);
  const customerNotes = normalizeText(lead.customer_notes);
  const text = `${serviceType} ${customerNotes}`;

  if (containsAny(text, ["water heater", "heater", "tankless", "hot water"])) return "water_heater";
  if (containsAny(text, ["repipe", "re-pipe", "reroute", "whole home pipe", "pipe replacement"])) return "repipe";
  if (containsAny(text, ["sewer", "main line", "backflow", "sewage"])) return "sewer_issue";
  if (containsAny(text, ["gas", "gas leak", "gas line"])) return "gas_line";
  if (containsAny(text, ["drain", "clog", "toilet backup", "slow drain"])) return "drain_issue";
  if (containsAny(text, ["leak", "burst", "slab leak", "water damage"])) return "water_leak";

  if (
    containsAny(text, [
      "install faucet",
      "faucet install",
      "fixture",
      "sink install",
      "toilet install",
      "shower valve",
      "replacement install",
    ])
  ) {
    return "fixture_installation";
  }

  if (containsAny(text, ["inspection", "camera", "diagnostic", "assessment", "troubleshoot", "check"])) {
    return "inspection_or_diagnosis";
  }

  if (containsAny(text, ["plumbing", "pipe", "water pressure", "valve", "repair"])) return "general_plumbing";

  return "unknown";
}

function getFieldQuality(lead: AnalysisLeadInput): FieldQuality {
  const notes = (lead.customer_notes || "").trim();
  const notesWordCount = notes.split(/\s+/).filter(Boolean).length;

  return {
    hasServiceType: !!lead.service_type?.trim(),
    hasUrgency: !!lead.urgency?.trim(),
    hasPhone: !!lead.phone?.trim(),
    hasCity: !!lead.city?.trim(),
    hasPropertyType: !!lead.property_type?.trim(),
    hasProblemDuration: !!lead.problem_duration?.trim(),
    notesRichEnough: notesWordCount >= 8 || notes.length >= 45,
  };
}

function buildMissingFields(quality: FieldQuality): IntakeAnalysisResult["missing_fields"] {
  const missing: IntakeAnalysisResult["missing_fields"] = [];

  if (!quality.hasPhone) missing.push("phone");
  if (!quality.hasCity) missing.push("city");
  if (!quality.hasServiceType) missing.push("service_type");
  if (!quality.notesRichEnough) missing.push("customer_notes");
  if (!quality.hasPropertyType) missing.push("property_type");
  if (!quality.hasProblemDuration) missing.push("problem_duration");
  if (!quality.hasUrgency) missing.push("urgency");

  return missing;
}

function calculateCompleteness(quality: FieldQuality, issue: IssueClassification): InfoCompletenessLevel {
  const criticalReady = quality.hasPhone && quality.hasCity && quality.hasServiceType && quality.hasUrgency;
  const contextualReady = quality.notesRichEnough && quality.hasPropertyType;
  const classificationReady = issue !== "unknown";

  if (criticalReady && contextualReady && classificationReady) {
    return "sufficient";
  }

  if (criticalReady || (quality.hasServiceType && quality.notesRichEnough)) {
    return "partial";
  }

  return "insufficient";
}

function buildSuggestedPriceRange(
  issue: IssueClassification,
  completeness: InfoCompletenessLevel,
  urgency: string,
): SuggestedPriceRange {
  if (completeness === "insufficient") {
    return {
      band: "insufficient_information",
      min: null,
      max: null,
      currency: "USD",
      notes: "Do not quote internally until key intake details are completed.",
    };
  }

  if (issue === "inspection_or_diagnosis") {
    return {
      band: "inspection_only",
      min: 89,
      max: 350,
      currency: "USD",
      notes: "Inspection-first placeholder only; field findings may change scope.",
    };
  }

  if (issue === "repipe" || issue === "sewer_issue" || issue === "gas_line") {
    return {
      band: "requires_site_visit",
      min: null,
      max: null,
      currency: "USD",
      notes: "Likely complex scope. Require site visit before any internal quote direction.",
    };
  }

  if (urgency === "high") {
    return {
      band: "likely_medium_job",
      min: 250,
      max: 1600,
      currency: "USD",
      notes: "High urgency placeholder; dispatch priority may add after-hours cost.",
    };
  }

  if (issue === "fixture_installation") {
    return {
      band: "likely_small_job",
      min: 180,
      max: 900,
      currency: "USD",
      notes: "Fixture-focused placeholder range pending parts confirmation.",
    };
  }

  if (issue === "water_heater" || issue === "water_leak" || issue === "drain_issue") {
    return {
      band: "likely_medium_job",
      min: 220,
      max: 2200,
      currency: "USD",
      notes: "Common repair/replacement placeholder range for internal triage only.",
    };
  }

  return {
    band: "likely_large_job",
    min: 300,
    max: 2800,
    currency: "USD",
    notes: "General plumbing placeholder range. Confirm scope before internal pricing direction.",
  };
}

function buildRecommendedAction(
  issue: IssueClassification,
  completeness: InfoCompletenessLevel,
  urgency: string,
): string {
  if (urgency === "high") {
    return "Priority-human follow-up now. Call customer to confirm exact risk area and dispatch readiness.";
  }

  if (completeness === "insufficient") {
    return "Hold pricing discussion. Intake team should collect missing core fields before ops assignment.";
  }

  if (issue === "inspection_or_diagnosis") {
    return "Route to inspection workflow and prepare a diagnostic-first service path.";
  }

  if (issue === "repipe" || issue === "sewer_issue" || issue === "gas_line") {
    return "Escalate to senior ops review; treat as higher-complexity scope pending on-site validation.";
  }

  return "Proceed with standard ops triage and prepare an internal preliminary scope note.";
}

function buildNextStep(lead: AnalysisLeadInput, missing: IntakeAnalysisResult["missing_fields"], issue: IssueClassification): string {
  if (missing.length > 0) {
    return `Collect missing intake fields first: ${missing.join(", ")}. Then re-run internal analysis before scheduling.`;
  }

  if (lead.urgency === "high") {
    return "Create immediate callback task (<=5 min), confirm access window, then assign nearest available technician.";
  }

  if (issue === "inspection_or_diagnosis") {
    return "Offer earliest inspection slot and request photos/video to reduce unknowns before dispatch.";
  }

  if (issue === "repipe" || issue === "sewer_issue" || issue === "gas_line") {
    return "Book site-visit assessment and capture layout constraints (property type, access, prior repairs).";
  }

  return "Assign lead owner, confirm customer availability, and prepare internal pre-quote checklist.";
}

function calculateConfidence(
  issue: IssueClassification,
  completeness: InfoCompletenessLevel,
  quality: FieldQuality,
): number {
  let score = 0.35;

  if (quality.hasPhone) score += 0.1;
  if (quality.hasCity) score += 0.1;
  if (quality.hasServiceType) score += 0.15;
  if (quality.hasUrgency) score += 0.1;
  if (quality.notesRichEnough) score += 0.1;
  if (quality.hasPropertyType) score += 0.05;
  if (quality.hasProblemDuration) score += 0.05;

  if (issue !== "unknown") score += 0.1;
  if (completeness === "insufficient") score -= 0.15;
  if (issue === "unknown") score -= 0.1;

  return Number(Math.max(0.2, Math.min(0.98, score)).toFixed(2));
}

export function buildRuleBasedIntakeAnalysis(lead: AnalysisLeadInput): IntakeAnalysisResult {
  const issueClassification = classifyIssue(lead);
  const quality = getFieldQuality(lead);
  const missingFields = buildMissingFields(quality);
  const infoCompleteness = calculateCompleteness(quality, issueClassification);

  return {
    issue_classification: issueClassification,
    info_completeness: infoCompleteness,
    missing_fields: missingFields,
    recommended_action: buildRecommendedAction(issueClassification, infoCompleteness, normalizeText(lead.urgency)),
    suggested_price_range: buildSuggestedPriceRange(issueClassification, infoCompleteness, normalizeText(lead.urgency)),
    next_step: buildNextStep(lead, missingFields, issueClassification),
    confidence: calculateConfidence(issueClassification, infoCompleteness, quality),
    analysis_version: "phase2-step3-rules",
  };
}
