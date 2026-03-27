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
  const selectedHook = script.hook_variants[hookVersionIndex] ?? script.hook_variants[0] ?? "";
  const lang = localization[language];

  const generatedCaption =
    language === "en"
      ? `${selectedHook} ${script.caption} ${lang.ctaSuffix}`
      : `【本地真实场景】${selectedHook}。${script.caption} ${lang.ctaSuffix}`;

  const generatedCTA = language === "en" ? script.CTA : `如果你在本地服务范围，${lang.ctaSuffix}`;
  const generatedPinnedComment = `${lang.pinPrefix}，我们会按风险优先级回复。`;

  return {
    scriptId: script.id,
    language,
    hookVersionIndex,
    editableScript: [selectedHook, script.standard_script, lang.caution].join("\n\n"),
    generatedCaption,
    generatedCTA,
    generatedPinnedComment,
    authenticityRisk: mapRisk(script.exaggeration_risk),
    aiSmellRisk: mapRisk(script.ai_smell_risk),
    suggestions: [
      "Add one field-verified detail (date/location/scope).",
      "Keep first 3 seconds problem-specific instead of broad claims.",
      "End with review-before-publish cue for manual QC.",
    ],
    reviewStatus: script.review_status,
    reviewerNotes: script.reviewer_notes,
    versionHistory: script.version_history,
    requiresManualReview: script.review_status !== "approved",
    realismScore: script.trustworthiness_score,
    exaggerationRisk: mapRisk(script.exaggeration_risk),
    duplicationRisk: mapRisk(script.ai_smell_risk + Math.max(0, 50 - script.trustworthiness_score)),
    publishBlocked: script.review_status !== "approved" || script.exaggeration_risk >= 60 || script.ai_smell_risk >= 60,
  };
}
