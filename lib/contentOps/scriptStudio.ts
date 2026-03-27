import type { ScriptPack } from "@/lib/contentOps/types";

export type ScriptStudioDraft = {
  scriptId: string;
  language: "en" | "zh";
  hookVersionIndex: number;
  editableScript: string;
  generatedCaption: string;
  generatedCTA: string;
  generatedPinnedComment: string;
  authenticityRisk: "low" | "medium" | "high";
  aiSmellRisk: "low" | "medium" | "high";
  suggestions: string[];
  reviewStatus: ScriptPack["review_status"];
  reviewerNotes: string;
  versionHistory: ScriptPack["version_history"];
  requiresManualReview: boolean;
  realismScore: number;
  exaggerationRisk: "low" | "medium" | "high";
  duplicationRisk: "low" | "medium" | "high";
  publishBlocked: boolean;
};

const localization = {
  en: {
    ctaSuffix: "DM your symptom + city for next-step guidance.",
    pinPrefix: "Comment your exact symptom and timeline",
    caution: "Avoid absolute promises and keep evidence specific.",
  },
  zh: {
    ctaSuffix: "私信“症状+城市”，给你下一步排查建议。",
    pinPrefix: "评论区留下“具体症状+出现频率”",
    caution: "避免绝对化承诺，结论必须可验证。",
  },
} as const;

function mapRisk(score: number): "low" | "medium" | "high" {
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function buildScriptStudioDraft(script: ScriptPack, language: "en" | "zh", hookVersionIndex = 0): ScriptStudioDraft {
  const safeScript = script && typeof script === "object" ? script : ({} as ScriptPack);
  const safeHooks = Array.isArray(safeScript.hook_variants) ? safeScript.hook_variants : [];
  const selectedHook = safeHooks[hookVersionIndex] ?? safeHooks[0] ?? "";
  const lang = localization[language];

  const generatedCaption =
    language === "en"
      ? `${selectedHook} ${safeScript.caption ?? ""} ${lang.ctaSuffix}`
      : `【本地真实场景】${selectedHook}。${safeScript.caption ?? ""} ${lang.ctaSuffix}`;

  const generatedCTA = language === "en" ? (safeScript.CTA ?? "") : `如果你在本地服务范围，${lang.ctaSuffix}`;
  const generatedPinnedComment = `${lang.pinPrefix}，我们会按风险优先级回复。`;

  return {
    scriptId: safeScript.id ?? "unknown_script",
    language,
    hookVersionIndex,
    editableScript: [selectedHook, safeScript.standard_script ?? "", lang.caution].join("\n\n"),
    generatedCaption,
    generatedCTA,
    generatedPinnedComment,
    authenticityRisk: mapRisk(safeScript.exaggeration_risk ?? 100),
    aiSmellRisk: mapRisk(safeScript.ai_smell_risk ?? 100),
    suggestions: [
      "Add one field-verified detail (date/location/scope).",
      "Keep first 3 seconds problem-specific instead of broad claims.",
      "End with review-before-publish cue for manual QC.",
    ],
    reviewStatus: safeScript.review_status ?? "draft",
    reviewerNotes: safeScript.reviewer_notes ?? "",
    versionHistory: Array.isArray(safeScript.version_history) ? safeScript.version_history : [],
    requiresManualReview: (safeScript.review_status ?? "draft") !== "approved",
    realismScore: safeScript.trustworthiness_score ?? 0,
    exaggerationRisk: mapRisk(safeScript.exaggeration_risk ?? 100),
    duplicationRisk: mapRisk((safeScript.ai_smell_risk ?? 100) + Math.max(0, 50 - (safeScript.trustworthiness_score ?? 0))),
    publishBlocked: (safeScript.review_status ?? "draft") !== "approved" || (safeScript.exaggeration_risk ?? 100) >= 60 || (safeScript.ai_smell_risk ?? 100) >= 60,
  };
}
