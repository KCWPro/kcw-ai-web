import { stageToMonetizationPlan } from "@/lib/contentOps/strategyEngine";
import type { MonetizationStage, PerformanceRecord } from "@/lib/contentOps/types";

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
  };
}
