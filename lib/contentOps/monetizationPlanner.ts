import { stageToMonetizationPlan } from "@/lib/contentOps/strategyEngine";
import type { MonetizationExecutionLabel, MonetizationStage, PerformanceRecord } from "@/lib/contentOps/types";

export function inferMonetizationStage(records: PerformanceRecord[]): MonetizationStage {
  const totalLeads = records.reduce((sum, item) => sum + item.leads, 0);
  const avgViews = records.length ? records.reduce((sum, item) => sum + item.views, 0) / records.length : 0;

  if (totalLeads >= 20 && avgViews >= 3000) return "stage_3_affiliate";
  if (totalLeads >= 10) return "stage_2_local_lead";
  return "stage_1_trust";
}

export function buildMonetizationPlanner(records: PerformanceRecord[]) {
  const stage = inferMonetizationStage(records);
  const plan = stageToMonetizationPlan(stage);
  const ctaRecommendation =
    stage === "stage_1_trust"
      ? "CTA: ask practical question + collect pain points; no hard sell."
      : stage === "stage_2_local_lead"
        ? "CTA: prioritize local DM triage (symptom + city) before any affiliate mention."
        : stage === "stage_3_affiliate"
          ? "CTA: lead-capture first, affiliate only when tool is directly educational."
          : stage === "stage_4_sponsor"
            ? "CTA: sponsor-safe disclosure + local service backup CTA."
            : "CTA: keep lead priority, treat platform payout as bonus.";

  return {
    ...plan,
    ordering_rule:
      "Priority: local lead conversion > sponsor/affiliate > platform payout. Keep authenticity above monetization velocity.",
    stage_guidance: {
      stage_1: "Build trust and consistent practical content.",
      stage_2: "Route traffic to KCW-owned contact channels.",
      stage_3: "Light affiliate only when educational fit is natural.",
      stage_4: "Selective sponsor integration with disclosure.",
      stage_5: "Track platform eligibility as secondary bonus.",
    },
    ctaRecommendation,
  };
}

export function inferExecutionLabel(record: PerformanceRecord): MonetizationExecutionLabel {
  if (record.leads >= 2 || record.dms >= 3) return "lead_capture";
  if (record.topic_type === "education" && record.views >= 2800) return "affiliate";
  if (record.topic_type === "real_case" || record.topic_type === "maintenance") return "sponsor_safe";
  return "education_only";
}

export function buildMonetizationExecutionMap(records: PerformanceRecord[]) {
  return records.map((record) => ({
    post_id: record.post_id,
    title: record.title,
    label: inferExecutionLabel(record),
    recommended_cta:
      inferExecutionLabel(record) === "lead_capture"
        ? "引导 DM：留下症状 + 城市，人工接管高意向线索。"
        : inferExecutionLabel(record) === "affiliate"
          ? "仅在教学上下文轻量推荐工具，并保留 lead 入口。"
          : inferExecutionLabel(record) === "sponsor_safe"
            ? "可放 sponsor-safe 口播，但不要覆盖本地 lead CTA。"
            : "教育向内容，CTA 以问题收集为主。",
  }));
}
