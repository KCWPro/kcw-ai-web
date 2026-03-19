import type { IntakeAnalysisResult } from "./aiIntakeAnalysis";

export type OperatorGuidanceLevel = "info" | "warning" | "critical";

export type OperatorGuidanceItem = {
  id: string;
  label: string;
  detail: string;
  level: OperatorGuidanceLevel;
};

export type OperatorGuidanceViewModel = {
  title: string;
  disclaimer: string;
  highlight: string;
  items: OperatorGuidanceItem[];
};

function formatMissingField(field: IntakeAnalysisResult["missing_fields"][number]) {
  return field.replace(/_/g, " ");
}

function getConfidenceLevel(confidence: number): OperatorGuidanceLevel {
  if (confidence < 0.5) return "critical";
  if (confidence < 0.75) return "warning";
  return "info";
}

function buildCompletenessReminder(
  completeness: IntakeAnalysisResult["info_completeness"],
  missingFields: IntakeAnalysisResult["missing_fields"],
): OperatorGuidanceItem {
  if (completeness === "sufficient") {
    return {
      id: "completeness",
      label: "Intake Completeness",
      detail: "信息完整度较高，可继续人工评估并确认执行路径。",
      level: "info",
    };
  }

  if (completeness === "partial") {
    return {
      id: "completeness",
      label: "Intake Completeness",
      detail:
        missingFields.length > 0
          ? `信息部分完整。建议先补齐：${missingFields.map(formatMissingField).join(", ")}，再做后续判断。`
          : "信息部分完整。建议人工复核关键字段后再推进。",
      level: "warning",
    };
  }

  return {
    id: "completeness",
    label: "Intake Completeness",
    detail:
      missingFields.length > 0
        ? `信息不足。请优先补齐：${missingFields.map(formatMissingField).join(", ")}，当前不应直接推进后续动作。`
        : "信息不足。请先由人工补充关键信息后再处理。",
    level: "critical",
  };
}

export function buildOperatorGuidance(
  analysis: IntakeAnalysisResult | null,
  isFallback: boolean,
): OperatorGuidanceViewModel | null {
  if (!analysis) {
    return null;
  }

  const confidenceLevel = getConfidenceLevel(analysis.confidence);
  const completenessReminder = buildCompletenessReminder(analysis.info_completeness, analysis.missing_fields);

  const missingFieldsDetail =
    analysis.missing_fields.length > 0
      ? analysis.missing_fields.map(formatMissingField).join(", ")
      : "暂无缺失字段";

  const highlight =
    analysis.info_completeness === "insufficient"
      ? "当前为低完整度，请先补齐关键字段再继续人工判断。"
      : confidenceLevel === "critical"
        ? "当前置信度偏低，请谨慎使用建议并进行人工复核。"
        : isFallback
          ? "当前分析来自降级路径，请人工确认关键风险后再决策。"
          : "建议可作为内部处理参考，最终动作仍需人工确认。";

  return {
    title: "Operator Guidance",
    disclaimer: "仅供内部建议参考，不会自动执行任何状态/报价/跟进动作。",
    highlight,
    items: [
      {
        id: "recommended_action",
        label: "Recommended Action",
        detail: analysis.recommended_action,
        level: analysis.info_completeness === "insufficient" ? "critical" : "info",
      },
      {
        id: "next_step",
        label: "Suggested Next Step",
        detail: analysis.next_step,
        level: analysis.info_completeness === "sufficient" ? "info" : "warning",
      },
      completenessReminder,
      {
        id: "missing_fields",
        label: "Missing Fields",
        detail: missingFieldsDetail,
        level: analysis.missing_fields.length > 0 ? "warning" : "info",
      },
      {
        id: "confidence",
        label: "Confidence",
        detail: `${analysis.confidence.toFixed(2)}（建议结合人工判断）`,
        level: confidenceLevel,
      },
    ],
  };
}
