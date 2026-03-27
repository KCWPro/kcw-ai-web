import type { MonetizationStage } from "@/lib/contentOps/types";

type ReviewSummary = {
  not_met: boolean;
  weakest_metric: string;
  diagnosis: string;
};

export function buildDashboardTopAlert(input: {
  cycleId: string;
  review: ReviewSummary;
  monetizationStage: MonetizationStage;
}) {
  const issueMap: Record<string, string> = {
    traffic_entry_problem: "开头 3 秒钩子不够具体，导致流量入口弱。",
    content_structure_problem: "内容结构重复且信息密度不平衡，导致完播下降。",
    conversion_problem: "CTA 时机偏晚，未形成有效私信与本地线索。",
    healthy: "当前周期健康，可继续小步实验。",
  };

  const action =
    input.review.diagnosis === "conversion_problem"
      ? "今日优先：发布 1 条 case+soft CTA，评论区引导到 DM。"
      : input.review.diagnosis === "traffic_entry_problem"
        ? "今日优先：对同主题执行 hook A/B 测试并复拍首 5 秒。"
        : "今日优先：补一条 before/after 证明型内容，提升信任转化。";

  const ctaByStage: Record<MonetizationStage, string> = {
    stage_1_trust: "CTA 建议：先收集评论问题，不强推服务。",
    stage_2_local_lead: "CTA 建议：优先引导本地 DM + 症状关键词。",
    stage_3_affiliate: "CTA 建议：仅在教学内容中轻量插入工具推荐。",
    stage_4_sponsor: "CTA 建议：带披露的场景化 sponsor 软植入。",
    stage_5_platform: "CTA 建议：保持转化优先，平台激励为次要收益。",
  };

  return {
    cycleStatus: `${input.cycleId} · ${input.review.not_met ? "未达标" : "达标"}`,
    weakestMetric: input.review.weakest_metric,
    criticalIssue: issueMap[input.review.diagnosis] ?? issueMap.healthy,
    todayPriority: action,
    monetizationStage: input.monetizationStage,
    ctaAdvice: ctaByStage[input.monetizationStage],
  };
}
