import { stageToMonetizationPlan } from "@/lib/contentOps/strategyEngine";
import type {
  AffiliateRecommendation,
  CTAType,
  LocalCollabRecommendation,
  MonetizationExecutionDecision,
  MonetizationExecutionLabel,
  MonetizationFiveDayReview,
  MonetizationStage,
  PerformanceRecord,
  RatioGuardResult,
  SponsorRecommendation,
  StagePolicy,
} from "@/lib/contentOps/types";

const STAGE_POLICIES: Record<MonetizationStage, StagePolicy> = {
  stage_1_trust: {
    stage: "stage_1_trust",
    stage_name: "Stage 1: Trust building",
    primary_revenue_focus: "Local lead trust foundations",
    avoid_revenue_modes: ["sponsor", "high-frequency affiliate"],
    recommended_content_ratio: { education_only: 0.65, lead_capture: 0.25, affiliate_candidate: 0.06, sponsor_safe: 0.02, local_ad_collab_candidate: 0.02 },
    recommended_cta_ratio: { education: 0.6, lead: 0.35, affiliate: 0.03, sponsor: 0.02 },
    commercialization_cap: 0.3,
    forbidden_actions: ["Back-to-back sponsor clips", "Hard product pitch in safety content"],
  },
  stage_2_local_lead: {
    stage: "stage_2_local_lead",
    stage_name: "Stage 2: Lead-first growth",
    primary_revenue_focus: "Local service lead capture",
    avoid_revenue_modes: ["Sponsor-heavy weeks"],
    recommended_content_ratio: { education_only: 0.5, lead_capture: 0.3, affiliate_candidate: 0.1, sponsor_safe: 0.05, local_ad_collab_candidate: 0.05 },
    recommended_cta_ratio: { education: 0.4, lead: 0.45, affiliate: 0.1, sponsor: 0.05 },
    commercialization_cap: 0.45,
    forbidden_actions: ["Affiliate CTA replacing service CTA", "Unverified partner endorsements"],
  },
  stage_3_affiliate: {
    stage: "stage_3_affiliate",
    stage_name: "Stage 3: Lead + light affiliate",
    primary_revenue_focus: "Lead plus low-risk educational affiliate",
    avoid_revenue_modes: ["Unrelated product categories"],
    recommended_content_ratio: { education_only: 0.45, lead_capture: 0.3, affiliate_candidate: 0.15, sponsor_safe: 0.06, local_ad_collab_candidate: 0.04 },
    recommended_cta_ratio: { education: 0.35, lead: 0.4, affiliate: 0.18, sponsor: 0.07 },
    commercialization_cap: 0.5,
    forbidden_actions: ["Affiliate-only week", "No-disclosure product mention"],
  },
  stage_4_sponsor: {
    stage: "stage_4_sponsor",
    stage_name: "Stage 4: Lead + affiliate + sponsor",
    primary_revenue_focus: "Lead remains primary with controlled sponsor",
    avoid_revenue_modes: ["Aggressive sponsorship cadence"],
    recommended_content_ratio: { education_only: 0.42, lead_capture: 0.28, affiliate_candidate: 0.15, sponsor_safe: 0.1, local_ad_collab_candidate: 0.05 },
    recommended_cta_ratio: { education: 0.32, lead: 0.38, affiliate: 0.18, sponsor: 0.12 },
    commercialization_cap: 0.58,
    forbidden_actions: ["Three sponsor posts in a row", "Hard-sell sponsor CTA"],
  },
  stage_5_platform: {
    stage: "stage_5_platform",
    stage_name: "Stage 5: Mature mixed monetization",
    primary_revenue_focus: "Balanced mix with lead protection",
    avoid_revenue_modes: ["Platform payout-only strategy"],
    recommended_content_ratio: { education_only: 0.4, lead_capture: 0.27, affiliate_candidate: 0.16, sponsor_safe: 0.1, local_ad_collab_candidate: 0.07 },
    recommended_cta_ratio: { education: 0.3, lead: 0.38, affiliate: 0.18, sponsor: 0.14 },
    commercialization_cap: 0.6,
    forbidden_actions: ["Dropping local lead CTA below 20%", "Off-brand co-branded ads"],
  },
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function engagementRate(record: PerformanceRecord) {
  const interactions = record.likes + record.comments + record.saves + record.shares;
  return record.views > 0 ? interactions / record.views : 0;
}

export function inferMonetizationStage(records: PerformanceRecord[]): MonetizationStage {
  const totalLeads = records.reduce((sum, item) => sum + item.leads, 0);
  const avgViews = records.length ? records.reduce((sum, item) => sum + item.views, 0) / records.length : 0;
  const avgRetention = records.length ? records.reduce((sum, item) => sum + item.retention, 0) / records.length : 0;
  const avgEngagement = records.length ? records.reduce((sum, item) => sum + engagementRate(item), 0) / records.length : 0;

  if (avgViews >= 9000 && avgRetention >= 0.34 && avgEngagement >= 0.08 && totalLeads >= 25) return "stage_5_platform";
  if (avgViews >= 6000 && avgRetention >= 0.31 && totalLeads >= 18) return "stage_4_sponsor";
  if (totalLeads >= 12 && avgViews >= 2800) return "stage_3_affiliate";
  if (totalLeads >= 6) return "stage_2_local_lead";
  return "stage_1_trust";
}

function evaluateScores(record: PerformanceRecord, stage: MonetizationStage) {
  const leadScore = clampScore(record.leads * 18 + record.dms * 9 + record.profile_visits * 0.18 + (record.topic_type === "real_case" ? 10 : 0));
  const affiliateScore = clampScore(record.saves * 1.6 + record.views * 0.003 + (record.topic_type === "maintenance" || record.topic_type === "education" ? 18 : 0) + (stage === "stage_1_trust" ? -14 : 0));
  const sponsorScore = clampScore(record.views * 0.004 + record.retention * 110 + (record.topic_type === "real_case" ? 16 : 0) + (stage === "stage_1_trust" ? -24 : 0));
  const trustRisk = clampScore((record.missed_metrics.length * 6) + 22 + (record.topic_type === "myth" ? 14 : 0));
  const commercializationRisk = clampScore((affiliateScore + sponsorScore) * 0.5 - leadScore * 0.2 + (stage === "stage_1_trust" ? 12 : 0));
  const audienceFit = clampScore(record.retention * 120 + engagementRate(record) * 220 + (record.language.includes("zh") ? 5 : 0));

  return {
    lead_score: leadScore,
    affiliate_score: affiliateScore,
    sponsor_score: sponsorScore,
    trust_risk_score: trustRisk,
    commercialization_risk_score: commercializationRisk,
    audience_fit_score: audienceFit,
  };
}

function pickLabels(scores: ReturnType<typeof evaluateScores>, stage: MonetizationStage): MonetizationExecutionLabel[] {
  const labels: MonetizationExecutionLabel[] = [];
  if (scores.lead_score >= 60) labels.push("lead_capture");
  if (scores.affiliate_score >= 58 && stage !== "stage_1_trust") labels.push("affiliate_candidate");
  if (scores.sponsor_score >= 62 && stage === "stage_4_sponsor") labels.push("sponsor_safe");
  if (scores.sponsor_score >= 68 && stage === "stage_5_platform") labels.push("sponsor_safe");
  if (scores.audience_fit_score >= 70 && scores.lead_score < 55) labels.push("platform_growth_only");
  if (scores.lead_score >= 45 && scores.audience_fit_score >= 60 && (stage === "stage_3_affiliate" || stage === "stage_4_sponsor" || stage === "stage_5_platform")) {
    labels.push("local_ad_collab_candidate");
  }
  if (labels.length === 0 || scores.trust_risk_score >= 75) labels.push("education_only");
  return Array.from(new Set(labels));
}

function buildCtaRecommendation(primaryLabel: MonetizationExecutionLabel): { cta: string; ctaType: CTAType; route: "DM/form/phone" | "DM/form" | "none" } {
  if (primaryLabel === "lead_capture") return { cta: "DM photos/videos + city for triage, or request service form/call.", ctaType: "lead", route: "DM/form/phone" };
  if (primaryLabel === "affiliate_candidate") {
    return {
      cta: "If you want an easier fix, check this tool type first; keep service route open if issue persists.",
      ctaType: "affiliate",
      route: "DM/form",
    };
  }
  if (primaryLabel === "sponsor_safe") return { cta: "Soft branded mention with disclosure, then return to homeowner action steps.", ctaType: "sponsor", route: "DM/form" };
  return { cta: "Save this tip, follow for homeowner fixes, comment if this happened to you.", ctaType: "education", route: "none" };
}

function buildAffiliateRecommendation(record: PerformanceRecord, labels: MonetizationExecutionLabel[]): AffiliateRecommendation {
  const allowed = labels.includes("affiliate_candidate") && (record.topic_type === "education" || record.topic_type === "maintenance" || record.topic_type === "faq");
  const category: AffiliateRecommendation["product_category"] = !allowed
    ? "not_recommended"
    : record.topic_type === "maintenance"
      ? "drain_maintenance_supply"
      : record.topic_type === "faq"
        ? "repair_assist_item"
        : "homeowner_basic_tool";

  return {
    recommended: allowed,
    product_fit_reason: allowed ? "Content solves recurring homeowner maintenance problem with practical low-risk tools." : "Content should stay education-first without product insertion.",
    affiliate_angle: allowed ? "Position product as optional convenience, not required purchase." : "No affiliate angle recommended.",
    soft_affiliate_cta: allowed ? "If you keep one thing at home, make it this category of tool." : "No affiliate CTA.",
    trust_risk_if_promoted: allowed ? 28 : 8,
    product_category: category,
    educational_script_variant: "Explain root cause, prevention steps, and safety warning with no product pitch.",
    soft_affiliate_script_variant: allowed
      ? "After core fix steps, mention one optional low-risk tool that makes maintenance easier; avoid urgency wording."
      : "Keep as pure education script.",
  };
}

function buildSponsorRecommendation(record: PerformanceRecord, labels: MonetizationExecutionLabel[]): SponsorRecommendation {
  const safe = labels.includes("sponsor_safe") && record.topic_type !== "myth";
  return {
    sponsor_safe: safe,
    brand_fit_reason: safe ? "Real-case or maintenance format can carry light integration without breaking trust." : "Topic is not suitable for sponsor insertion due to trust/clarity risk.",
    integration_style: safe ? "5-8 second disclosed mention embedded after diagnosis section." : "No integration.",
    disclosure_required: safe,
    trust_risk: safe ? 34 : 12,
    sponsor_proposal_draft: safe
      ? `Draft: KCW can integrate a homeowner-safe product mention in ${record.title} with clear disclosure and lead-first CTA.`
      : "Draft withheld: this content should remain unsponsored.",
    collaboration_angle_suggestion: safe ? "Safety-first maintenance education with local service credibility." : "Focus on trust-building non-sponsored content.",
    local_partner_fit_suggestion: safe ? "Suitable for material supplier or appliance/heater service partner." : "Not a sponsor candidate this cycle.",
  };
}

function buildLocalCollabRecommendation(record: PerformanceRecord, labels: MonetizationExecutionLabel[]): LocalCollabRecommendation {
  if (!labels.includes("local_ad_collab_candidate")) {
    return {
      local_partner_fit: "weak",
      collaboration_type: "not_recommended",
      likely_risk: "Forced collab would look unnatural for this post.",
      intro_angle: "Keep local service education tone.",
      outreach_draft: "No outreach draft generated for this asset.",
    };
  }

  const collaborationType: LocalCollabRecommendation["collaboration_type"] =
    record.topic_type === "real_case"
      ? "property_management"
      : record.topic_type === "maintenance"
        ? "material_supplier"
        : record.topic_type === "faq"
          ? "insurance"
          : "real_estate";

  return {
    local_partner_fit: "strong",
    collaboration_type: collaborationType,
    likely_risk: "Low if integration stays informational and clearly local-relevant.",
    intro_angle: "Co-create homeowner prevention checklist localized for neighborhood housing stock.",
    outreach_draft: `Hi, we produce local homeowner repair education and saw overlap with ${collaborationType}. Open to a trust-first educational collaboration sample?`,
  };
}

function pickPrimaryLabel(labels: MonetizationExecutionLabel[], score: ReturnType<typeof evaluateScores>): MonetizationExecutionLabel {
  if (labels.includes("lead_capture") && score.lead_score >= Math.max(score.affiliate_score, score.sponsor_score)) return "lead_capture";
  if (labels.includes("affiliate_candidate") && score.affiliate_score >= score.sponsor_score) return "affiliate_candidate";
  if (labels.includes("sponsor_safe")) return "sponsor_safe";
  if (labels.includes("local_ad_collab_candidate")) return "local_ad_collab_candidate";
  if (labels.includes("platform_growth_only")) return "platform_growth_only";
  return "education_only";
}

export function buildMonetizationExecutionMap(records: PerformanceRecord[]): MonetizationExecutionDecision[] {
  const stage = inferMonetizationStage(records);

  return records.map((record) => {
    const score = evaluateScores(record, stage);
    const labels = pickLabels(score, stage);
    const primaryLabel = pickPrimaryLabel(labels, score);
    const cta = buildCtaRecommendation(primaryLabel);
    const affiliate = buildAffiliateRecommendation(record, labels);
    const sponsor = buildSponsorRecommendation(record, labels);
    const localCollab = buildLocalCollabRecommendation(record, labels);

    return {
      post_id: record.post_id,
      title: record.title,
      labels,
      primary_label: primaryLabel,
      recommended_cta: cta.cta,
      cta_type: cta.ctaType,
      lead_capture_route: cta.route,
      authenticity_guard:
        score.trust_risk_score >= 70
          ? "High trust-risk: keep education-only, no commercial insertion."
          : "Disclose commercial relationship and keep lead-first homeowner utility framing.",
      blocked_monetization_modes:
        primaryLabel === "education_only" ? ["affiliate_candidate", "sponsor_safe"] : primaryLabel === "lead_capture" ? ["hard_sponsor_pitch"] : [],
      score,
      affiliate,
      sponsor,
      local_collab: localCollab,
    };
  });
}

export function applyMonetizationOverride(
  items: Array<{ post_id: string; primary_label: MonetizationExecutionLabel; recommended_cta: string; cta_type?: CTAType }>,
  overrides: Record<string, MonetizationExecutionLabel>,
) {
  return items.map((item) => {
    const override = overrides[item.post_id];
    if (!override) return item;
    const cta = buildCtaRecommendation(override);
    return {
      ...item,
      primary_label: override,
      recommended_cta: `Manual override applied: ${cta.cta}`,
      cta_type: cta.ctaType,
    };
  });
}

export function buildMonetizationRatioGuard(execution: MonetizationExecutionDecision[], stage: MonetizationStage): RatioGuardResult {
  const policy = STAGE_POLICIES[stage];
  const total = execution.length || 1;
  const counts: Record<MonetizationExecutionLabel, number> = {
    lead_capture: 0,
    affiliate_candidate: 0,
    sponsor_safe: 0,
    education_only: 0,
    platform_growth_only: 0,
    local_ad_collab_candidate: 0,
  };

  execution.forEach((item) => {
    counts[item.primary_label] += 1;
  });

  const actualRatio: Record<MonetizationExecutionLabel, number> = {
    lead_capture: counts.lead_capture / total,
    affiliate_candidate: counts.affiliate_candidate / total,
    sponsor_safe: counts.sponsor_safe / total,
    education_only: counts.education_only / total,
    platform_growth_only: counts.platform_growth_only / total,
    local_ad_collab_candidate: counts.local_ad_collab_candidate / total,
  };

  const warnings: RatioGuardResult["warnings"] = [];
  const commercialShare = actualRatio.affiliate_candidate + actualRatio.sponsor_safe + actualRatio.local_ad_collab_candidate;
  if (commercialShare > policy.commercialization_cap) warnings.push({ code: "commercial_overload", severity: "high", detail: `Commercial share ${(commercialShare * 100).toFixed(0)}% exceeds cap ${(policy.commercialization_cap * 100).toFixed(0)}%.` });

  const sponsorStreakRisk = execution.slice(0, 3).every((item) => item.primary_label === "sponsor_safe");
  if (sponsorStreakRisk) warnings.push({ code: "sponsor_streak", severity: "high", detail: "Top 3 most recent content all sponsor_safe." });
  if (actualRatio.affiliate_candidate > policy.recommended_content_ratio.affiliate_candidate + 0.05) {
    warnings.push({ code: "affiliate_trust_erosion", severity: "medium", detail: "Affiliate ratio trending above conservative range." });
  }
  if (execution.some((item) => item.primary_label === "lead_capture" && item.recommended_cta.toLowerCase().includes("call") && item.score.commercialization_risk_score > 60)) {
    warnings.push({ code: "hard_lead_cta", severity: "medium", detail: "Lead CTA appears too hard for current trust level." });
  }
  if (actualRatio.sponsor_safe + actualRatio.affiliate_candidate > 0.32 && actualRatio.education_only < 0.35) {
    warnings.push({ code: "ad_account_risk", severity: "high", detail: "Commercial density can make account feel like ad feed." });
  }

  const whatToReduce: MonetizationExecutionLabel[] = [];
  const whatToIncrease: MonetizationExecutionLabel[] = [];
  if (actualRatio.sponsor_safe > policy.recommended_content_ratio.sponsor_safe) whatToReduce.push("sponsor_safe");
  if (actualRatio.affiliate_candidate > policy.recommended_content_ratio.affiliate_candidate) whatToReduce.push("affiliate_candidate");
  if (actualRatio.education_only < policy.recommended_content_ratio.education_only) whatToIncrease.push("education_only");
  if (actualRatio.lead_capture < policy.recommended_content_ratio.lead_capture) whatToIncrease.push("lead_capture");

  return {
    recommended_ratio: policy.recommended_content_ratio,
    actual_ratio: actualRatio,
    warnings,
    suggested_rebalance_plan: [
      "Reduce sponsor-heavy or product-forward scripts for next 5 posts.",
      "Increase practical education posts with save/follow CTA.",
      "Keep lead CTA in local problem-solving context instead of direct pitch.",
    ],
    what_to_reduce: whatToReduce,
    what_to_increase: whatToIncrease,
  };
}

export function buildMonetizationPlanner(records: PerformanceRecord[]) {
  const stage = inferMonetizationStage(records);
  const plan = stageToMonetizationPlan(stage);
  const stagePolicy = STAGE_POLICIES[stage];
  const ctaRecommendation =
    stage === "stage_1_trust"
      ? "CTA: ask practical question + collect homeowner pain points; no hard sell."
      : stage === "stage_2_local_lead"
        ? "CTA: prioritize local DM triage (symptom + city) and service request form."
        : stage === "stage_3_affiliate"
          ? "CTA: lead-capture first, affiliate mention only as optional low-risk tool."
          : stage === "stage_4_sponsor"
            ? "CTA: sponsor-safe disclosure + service backup CTA, avoid hard brand push."
            : "CTA: mix lead + trust CTA, platform payout remains secondary.";

  return {
    ...plan,
    stage_name: stagePolicy.stage_name,
    stage_policy: stagePolicy,
    ordering_rule: "Priority: local lead conversion > affiliate/sponsor/local collab > platform payout. Authenticity always first.",
    ctaRecommendation,
  };
}

export function buildMonetizationFiveDayReview(records: PerformanceRecord[]): MonetizationFiveDayReview {
  const execution = buildMonetizationExecutionMap(records);
  const stage = inferMonetizationStage(records);
  const ratio = buildMonetizationRatioGuard(execution, stage);
  const leadPerf = execution.filter((item) => item.primary_label === "lead_capture").reduce((sum, item) => sum + item.score.lead_score, 0);
  const affiliatePerf = execution.filter((item) => item.primary_label === "affiliate_candidate").reduce((sum, item) => sum + item.score.affiliate_score, 0);
  const sponsorPerf = execution.filter((item) => item.primary_label === "sponsor_safe").reduce((sum, item) => sum + item.score.sponsor_score, 0);

  return {
    monetization_summary: `5-day lead-first status: ${stage}. lead=${leadPerf}, affiliate=${affiliatePerf}, sponsor=${sponsorPerf}.`,
    monetization_risk: ratio.warnings.map((item) => item.detail).join(" | ") || "No major over-commercialization warning.",
    next_cycle_monetization_plan: [
      "Keep 1-2 strong local lead posts in next 5-day cycle.",
      "Use affiliate only in maintenance/FAQ context with soft wording.",
      "Limit sponsor to max one slot per 5 posts unless trust risk stays low.",
    ],
    lead_performance_5d: leadPerf,
    affiliate_candidate_performance_5d: affiliatePerf,
    sponsor_safe_performance_5d: sponsorPerf,
    over_commercialized: ratio.warnings.some((item) => item.code === "commercial_overload" || item.code === "ad_account_risk"),
    natural_content_impact: ratio.actual_ratio.education_only < ratio.recommended_ratio.education_only ? "Education share dropped below safe baseline; recover trust content." : "Natural content baseline is within safe range.",
    next_ratio_recommendation: ratio.recommended_ratio,
  };
}

export function buildRevenueDashboard(records: PerformanceRecord[]) {
  const stage = inferMonetizationStage(records);
  const planner = buildMonetizationPlanner(records);
  const execution = buildMonetizationExecutionMap(records);
  const ratioGuard = buildMonetizationRatioGuard(execution, stage);
  const fiveDay = buildMonetizationFiveDayReview(records);

  const worthScaling = execution.filter((item) => item.score.lead_score >= 70 || item.score.audience_fit_score >= 74).slice(0, 5).map((item) => item.title);
  const doNotMonetize = execution.filter((item) => item.score.trust_risk_score >= 72).slice(0, 5).map((item) => item.title);

  return {
    current_primary_revenue_mode: planner.stage_policy.primary_revenue_focus,
    stage: planner.stage,
    stage_name: planner.stage_name,
    weekly_ratio: ratioGuard.actual_ratio,
    risk_warnings: ratioGuard.warnings,
    worth_scaling_for_monetization: worthScaling,
    should_not_monetize: doNotMonetize,
    highest_priority_action: planner.recommended_actions[0] ?? "Protect lead-first educational cadence.",
    next_5d_recommendation: fiveDay.next_cycle_monetization_plan,
    next_30d_recommendation: [
      "Stabilize lead-quality tracking by content label and CTA type.",
      "Only promote sponsor/affiliate categories that match homeowner safety and repair trust.",
      "Maintain conservative commercial caps from stage policy.",
    ],
    readiness_panel: {
      classification_coverage: execution.length,
      lead_signals: records.reduce((sum, item) => sum + item.leads + item.dms, 0),
      cta_outcomes: execution.reduce(
        (acc, item) => {
          acc[item.cta_type] += 1;
          return acc;
        },
        { lead: 0, affiliate: 0, sponsor: 0, education: 0 } as Record<CTAType, number>,
      ),
      sponsor_suitability_count: execution.filter((item) => item.sponsor.sponsor_safe).length,
    },
    ratio_guard: ratioGuard,
    monetization_execution: execution,
    monetization_five_day_review: fiveDay,
  };
}
