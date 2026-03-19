import OpenAI from "openai";
import type {
  AnalysisLeadInput,
  InfoCompletenessLevel,
  IntakeAnalysisResult,
  IssueClassification,
  SuggestedPriceBand,
} from "./aiIntakeAnalysisRules";

export type OpenAiIntakeErrorCategory = "missing_config" | "provider_execution_error" | "invalid_provider_output";

export class OpenAiIntakeError extends Error {
  category: OpenAiIntakeErrorCategory;

  constructor(category: OpenAiIntakeErrorCategory, message: string) {
    super(message);
    this.name = "OpenAiIntakeError";
    this.category = category;
  }
}

const allowedIssueClassifications = new Set<IssueClassification>([
  "drain_issue",
  "water_leak",
  "water_heater",
  "repipe",
  "sewer_issue",
  "gas_line",
  "fixture_installation",
  "inspection_or_diagnosis",
  "general_plumbing",
  "unknown",
]);

const allowedCompleteness = new Set<InfoCompletenessLevel>(["sufficient", "partial", "insufficient"]);
const allowedPriceBands = new Set<SuggestedPriceBand>([
  "inspection_only",
  "likely_small_job",
  "likely_medium_job",
  "likely_large_job",
  "requires_site_visit",
  "insufficient_information",
]);

const allowedMissingFields = new Set<IntakeAnalysisResult["missing_fields"][number]>([
  "phone",
  "city",
  "service_type",
  "customer_notes",
  "property_type",
  "problem_duration",
  "urgency",
]);

type OpenAiRawResponse = unknown;
type OpenAiIntakeRunner = (lead: AnalysisLeadInput, model: string, apiKey: string) => Promise<OpenAiRawResponse>;

let openAiRunnerOverride: OpenAiIntakeRunner | undefined;

export function __setOpenAiIntakeRunnerForTests(runner?: OpenAiIntakeRunner) {
  openAiRunnerOverride = runner;
}

function parseObject(input: unknown): Record<string, unknown> {
  if (!input) {
    throw new OpenAiIntakeError("invalid_provider_output", "OpenAI intake output is empty");
  }

  if (typeof input === "string") {
    const parsed = JSON.parse(input);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new OpenAiIntakeError("invalid_provider_output", "OpenAI intake output is not a JSON object");
    }
    return parsed as Record<string, unknown>;
  }

  if (typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }

  throw new OpenAiIntakeError("invalid_provider_output", "OpenAI intake output has unsupported type");
}

function toNonEmptyString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeIssueClassification(value: unknown): IssueClassification {
  const candidate = typeof value === "string" ? (value.trim().toLowerCase() as IssueClassification) : "unknown";
  return allowedIssueClassifications.has(candidate) ? candidate : "unknown";
}

function normalizeCompleteness(value: unknown): InfoCompletenessLevel {
  const candidate = typeof value === "string" ? (value.trim().toLowerCase() as InfoCompletenessLevel) : "insufficient";
  return allowedCompleteness.has(candidate) ? candidate : "insufficient";
}

function normalizeMissingFields(value: unknown): IntakeAnalysisResult["missing_fields"] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter((item): item is IntakeAnalysisResult["missing_fields"][number] => allowedMissingFields.has(item as never));

  return [...new Set(normalized)];
}

function normalizePriceBand(value: unknown): SuggestedPriceBand {
  const candidate = typeof value === "string" ? (value.trim().toLowerCase() as SuggestedPriceBand) : "insufficient_information";
  return allowedPriceBands.has(candidate) ? candidate : "insufficient_information";
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function normalizeConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.4;
  }

  const clamped = Math.max(0.2, Math.min(0.98, value));
  return Number(clamped.toFixed(2));
}

function normalizeOpenAiOutput(rawResponse: OpenAiRawResponse): IntakeAnalysisResult {
  const parsed = parseObject(rawResponse);

  const issueClassification = normalizeIssueClassification(parsed.issue_classification);
  const infoCompleteness = normalizeCompleteness(parsed.info_completeness);
  const missingFields = normalizeMissingFields(parsed.missing_fields);
  const recommendedAction = toNonEmptyString(parsed.recommended_action);
  const nextStep = toNonEmptyString(parsed.next_step);

  if (!recommendedAction || !nextStep) {
    throw new OpenAiIntakeError("invalid_provider_output", "OpenAI intake output missing required action fields");
  }

  const priceInput = parseObject(parsed.suggested_price_range);
  const band = normalizePriceBand(priceInput.band);
  const min = normalizeNumber(priceInput.min);
  const max = normalizeNumber(priceInput.max);

  if (min !== null && max !== null && min > max) {
    throw new OpenAiIntakeError("invalid_provider_output", "OpenAI intake output has invalid price range");
  }

  return {
    issue_classification: issueClassification,
    info_completeness: infoCompleteness,
    missing_fields: missingFields,
    recommended_action: recommendedAction,
    suggested_price_range: {
      band,
      min,
      max,
      currency: "USD",
      notes: toNonEmptyString(priceInput.notes, "AI placeholder range for internal triage only."),
    },
    next_step: nextStep,
    confidence: normalizeConfidence(parsed.confidence),
    analysis_version: "phase2-step4-openai",
  };
}

function buildIntakePrompt(lead: AnalysisLeadInput): string {
  return [
    "You are an internal plumbing operations intake analyst.",
    "Return JSON only. No markdown. No customer-facing language.",
    "Never produce promises or final quotes. suggested_price_range is internal placeholder only.",
    'Use exactly these top-level keys: issue_classification, info_completeness, missing_fields, recommended_action, suggested_price_range, next_step, confidence.',
    "Allowed issue_classification: drain_issue, water_leak, water_heater, repipe, sewer_issue, gas_line, fixture_installation, inspection_or_diagnosis, general_plumbing, unknown.",
    "Allowed info_completeness: sufficient, partial, insufficient.",
    "Allowed missing_fields values: phone, city, service_type, customer_notes, property_type, problem_duration, urgency.",
    "suggested_price_range keys: band, min, max, notes.",
    "Allowed band: inspection_only, likely_small_job, likely_medium_job, likely_large_job, requires_site_visit, insufficient_information.",
    "confidence must be number between 0 and 1.",
    "Lead:",
    JSON.stringify(lead),
  ].join("\n");
}

async function callOpenAi(lead: AnalysisLeadInput, model: string, apiKey: string): Promise<OpenAiRawResponse> {
  const client = new OpenAI({ apiKey, timeout: 8000 });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You analyze plumbing intake leads for internal operations only.",
        },
        {
          role: "user",
          content: buildIntakePrompt(lead),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new OpenAiIntakeError("invalid_provider_output", "OpenAI intake response content is empty");
    }

    return content;
  } catch (error: unknown) {
    if (error instanceof OpenAiIntakeError) {
      throw error;
    }

    throw new OpenAiIntakeError("provider_execution_error", error instanceof Error ? error.message : "OpenAI execution failed");
  }
}

export async function runOpenAiIntakeAnalysis(lead: AnalysisLeadInput): Promise<IntakeAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();

  if (!apiKey) {
    throw new OpenAiIntakeError("missing_config", "OPENAI_API_KEY missing");
  }

  if (!model) {
    throw new OpenAiIntakeError("missing_config", "OPENAI_MODEL missing");
  }

  const runner = openAiRunnerOverride || callOpenAi;
  let rawResponse: OpenAiRawResponse;

  try {
    rawResponse = await runner(lead, model, apiKey);
  } catch (error: unknown) {
    if (error instanceof OpenAiIntakeError) {
      throw error;
    }

    throw new OpenAiIntakeError("provider_execution_error", error instanceof Error ? error.message : "OpenAI execution failed");
  }

  try {
    return normalizeOpenAiOutput(rawResponse);
  } catch (error: unknown) {
    if (error instanceof OpenAiIntakeError) {
      throw error;
    }

    throw new OpenAiIntakeError("invalid_provider_output", error instanceof Error ? error.message : "OpenAI output invalid");
  }
}
