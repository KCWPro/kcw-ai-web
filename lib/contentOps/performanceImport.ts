import { importedPerformanceCsv } from "@/data/contentOps/importedPerformance";
import type { LanguageMode, PerformanceRecord, Platform, Topic, VideoFormat } from "@/lib/contentOps/types";

const platformSet = new Set<Platform>(["tiktok", "instagram_reels", "youtube_shorts", "rednote", "facebook_reels"]);
const languageSet = new Set<LanguageMode>(["en", "zh", "en_audio_zh_sub", "zh_audio_en_sub", "bilingual_caption"]);
const topicTypeSet = new Set<Topic["content_type"]>(["education", "real_case", "faq", "myth", "maintenance"]);
const formatSet = new Set<VideoFormat>([
  "talking_head",
  "b_roll_subtitle",
  "before_after",
  "faq_quick_answer",
  "myth_busting",
  "top_3_tips",
  "problem_cause_fix",
  "day_on_job",
  "dont_do_this",
  "quote_education",
  "code_compliance_explainer",
  "local_service_reminder",
]);

export type PerformanceImportResult = {
  records: PerformanceRecord[];
  errors: string[];
  source: "csv" | "sheet" | "default_seed";
  sheetAdapter: {
    provider: "google_sheet_readonly_stub";
    ready: boolean;
    next_step: string;
  };
};

const requiredHeaders = [
  "post_id",
  "platform",
  "posted_at",
  "views",
  "retention",
  "likes",
  "comments",
  "saves",
  "shares",
  "follows",
  "profile_visits",
  "dms",
  "leads",
  "topic_type",
  "format_type",
  "language",
  "posting_time",
  "analysis_summary",
  "cycle_id",
  "goal_met",
  "title",
  "hook",
  "script_expression",
  "structure_signature",
] as const;

type HeaderKey = (typeof requiredHeaders)[number];

function parseDelimited(text: string, delimiter: "," | "\t") {
  const trimmed = text.trim();
  if (!trimmed) return [] as string[][];
  return trimmed
    .split(/\r?\n/)
    .map((line) => line.split(delimiter).map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));
}

function toNumber(row: Record<HeaderKey, string>, key: HeaderKey) {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function toRecord(row: Record<HeaderKey, string>, index: number): { record: PerformanceRecord | null; error?: string } {
  const platform = row.platform as Platform;
  const language = row.language as LanguageMode;
  const topicType = row.topic_type as Topic["content_type"];
  const formatType = row.format_type as VideoFormat;

  if (!platformSet.has(platform)) return { record: null, error: `row ${index + 2}: invalid platform` };
  if (!languageSet.has(language)) return { record: null, error: `row ${index + 2}: invalid language` };
  if (!topicTypeSet.has(topicType)) return { record: null, error: `row ${index + 2}: invalid topic_type` };
  if (!formatSet.has(formatType)) return { record: null, error: `row ${index + 2}: invalid format_type` };

  return {
    record: {
      post_id: row.post_id,
      platform,
      posted_at: row.posted_at,
      views: toNumber(row, "views"),
      retention: toNumber(row, "retention"),
      likes: toNumber(row, "likes"),
      comments: toNumber(row, "comments"),
      saves: toNumber(row, "saves"),
      shares: toNumber(row, "shares"),
      follows: toNumber(row, "follows"),
      profile_visits: toNumber(row, "profile_visits"),
      dms: toNumber(row, "dms"),
      leads: toNumber(row, "leads"),
      topic_type: topicType,
      format_type: formatType,
      language,
      posting_time: row.posting_time,
      analysis_summary: row.analysis_summary,
      cycle_id: row.cycle_id,
      goal_met: row.goal_met === "true",
      missed_metrics: [],
      root_causes: [],
      optimization_actions: [],
      next_cycle_strategy: "derived_from_import",
      title: row.title,
      hook: row.hook,
      script_expression: row.script_expression,
      structure_signature: row.structure_signature,
    },
  };
}

function parseFromRows(rows: string[][]): PerformanceImportResult {
  if (rows.length < 2)
    return {
      records: [],
      errors: ["import requires header + at least one data row"],
      source: "csv",
      sheetAdapter: {
        provider: "google_sheet_readonly_stub",
        ready: false,
        next_step: "Provide sheet_id + range for readonly pull.",
      },
    };

  const header = rows[0] as string[];
  const missing = requiredHeaders.filter((key) => !header.includes(key));
  if (missing.length > 0)
    return {
      records: [],
      errors: [`missing required columns: ${missing.join(", ")}`],
      source: "csv",
      sheetAdapter: {
        provider: "google_sheet_readonly_stub",
        ready: false,
        next_step: "Provide sheet_id + range for readonly pull.",
      },
    };

  const headerIndex = new Map(header.map((item, idx) => [item, idx]));
  const records: PerformanceRecord[] = [];
  const errors: string[] = [];

  rows.slice(1).forEach((cells, rowIndex) => {
    const rowObject = Object.fromEntries(
      requiredHeaders.map((key) => [key, cells[headerIndex.get(key) ?? -1] ?? ""]),
    ) as Record<HeaderKey, string>;

    const parsed = toRecord(rowObject, rowIndex);
    if (parsed.record) {
      records.push(parsed.record);
    } else if (parsed.error) {
      errors.push(parsed.error);
    }
  });

  if (records.length === 0) {
    errors.unshift("no valid rows parsed: check enum values and required fields");
  }

  return {
    records,
    errors,
    source: "csv",
    sheetAdapter: {
      provider: "google_sheet_readonly_stub",
      ready: false,
      next_step: "Provide sheet_id + range for readonly pull.",
    },
  };
}

export function importPerformanceFromCsv(csvText: string): PerformanceImportResult {
  const parsed = parseFromRows(parseDelimited(csvText, ","));
  return { ...parsed, source: "csv" };
}

export function importPerformanceFromSheetText(sheetText: string): PerformanceImportResult {
  const parsed = parseFromRows(parseDelimited(sheetText, "\t"));
  return { ...parsed, source: "sheet" };
}

export function loadDefaultPerformanceRecords() {
  const parsed = importPerformanceFromCsv(importedPerformanceCsv);
  return {
    ...parsed,
    source: "default_seed" as const,
  };
}

export async function importPerformanceFromCsvFile(file: File): Promise<PerformanceImportResult> {
  const content = await file.text();
  return importPerformanceFromCsv(content);
}
