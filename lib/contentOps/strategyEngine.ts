import type { ContentPillar, MonetizationPlan, MonetizationStage, Platform } from "@/lib/contentOps/types";

export type StrategyEngineOutput = {
  positioning: string;
  personas: string[];
  pillars: Array<{ pillar: ContentPillar; ratio: number; rationale: string }>;
  bilingualPolicy: string[];
  platformPolicy: Record<Platform, string>;
  publishingRhythm: {
    standard: string;
    busy: string;
    sprint: string;
  };
  dayPlan: Record<"day_0_30" | "day_31_60" | "day_61_90", string[]>;
  monetizationProgression: Array<{ stage: MonetizationStage; guardrail: string; trigger: string }>;
};

export function buildContentStrategyEngine(): StrategyEngineOutput {
  return {
    positioning: "Local, practical, field-first plumbing & home repair account for SoCal homeowners. Real service tone over high automation.",
    personas: [
      "English-speaking homeowner with recurring drain or water heater issues",
      "Chinese-speaking homeowner who prefers bilingual maintenance guidance",
      "Owner of older SoCal home needing prevention tips",
      "Price-sensitive homeowner comparing repair vs replacement",
      "Community viewer likely to refer neighbors/family",
    ],
    pillars: [
      { pillar: "common_issues", ratio: 0.25, rationale: "Daily pain points drive watch-through and saves." },
      { pillar: "mistakes_to_avoid", ratio: 0.15, rationale: "Practical warnings generate comments without fear marketing." },
      { pillar: "real_case", ratio: 0.2, rationale: "Real field evidence builds trust and lead intent." },
      { pillar: "maintenance", ratio: 0.15, rationale: "Maintenance content supports recurring evergreen output." },
      { pillar: "quote_education", ratio: 0.1, rationale: "Clarifies pricing concerns and improves conversion quality." },
      { pillar: "trust_knowledge", ratio: 0.07, rationale: "Demonstrates professional judgment, not hard selling." },
      { pillar: "brand_trust", ratio: 0.05, rationale: "Human team voice and consistency." },
      { pillar: "local_reminder", ratio: 0.03, rationale: "Local relevance and seasonal triggers." },
    ],
    bilingualPolicy: [
      "Default one language per video; use dual captions only when clarity improves.",
      "Use EN audio + ZH subtitle for broad reach and Chinese homeowner retention.",
      "Use ZH audio + EN subtitle for trust-building stories targeting Chinese households.",
      "Never stack full EN+ZH voiceovers in one short.",
    ],
    platformPolicy: {
      tiktok: "Fast hook, conflict in first 3 seconds, direct homeowner scenario.",
      instagram_reels: "Cleaner visual composition, credibility cues, practical captions.",
      youtube_shorts: "Search-friendly titles and educational clarity.",
      rednote: "Chinese copy clarity, practical notes, soft local trust CTA.",
      facebook_reels: "Community tone, family-homeowner relevance, less slang.",
    },
    publishingRhythm: {
      standard: "2 posts/day (1 practical + 1 case/brand) + 20 min interaction",
      busy: "1 post/day + 10 min comment triage + DM qualification",
      sprint: "3 posts/day for 5 days with controlled A/B hook testing",
    },
    dayPlan: {
      day_0_30: [
        "Stabilize cadence and baseline metrics.",
        "Prioritize practical FAQ and homeowner mistake content.",
        "Set manual review before publish for realism checks.",
      ],
      day_31_60: [
        "Expand case-based content with strict authenticity labels.",
        "Strengthen DM qualification and local lead capture CTA.",
        "Start repeating high performer patterns with variation safeguards.",
      ],
      day_61_90: [
        "Scale lead-oriented series and bilingual split testing.",
        "Introduce low-frequency affiliate-compatible educational content.",
        "Prepare sponsor-fit categories without hurting service authenticity.",
      ],
    },
    monetizationProgression: [
      { stage: "stage_1_trust", guardrail: "No hard sell", trigger: ">=14 days consistent publish + stable tone" },
      { stage: "stage_2_local_lead", guardrail: "Lead capture over creator payout", trigger: "DM quality and profile visits rising" },
      { stage: "stage_3_affiliate", guardrail: "Only natural fit products", trigger: "High trust score + repeat engagement" },
      { stage: "stage_4_sponsor", guardrail: "Protect KCW service credibility", trigger: "Consistent vertical content performance" },
      { stage: "stage_5_platform", guardrail: "Supplementary only", trigger: "Platform eligibility nearly met" },
    ],
  };
}

export function stageToMonetizationPlan(stage: MonetizationStage): MonetizationPlan {
  const plans: Record<MonetizationStage, MonetizationPlan> = {
    stage_1_trust: {
      stage,
      current_readiness: 45,
      recommended_actions: ["Publish practical content daily", "Prioritize saved/commented FAQ", "Build trust signals in profile"],
      blocked_actions: ["Frequent affiliate mentions", "Aggressive sponsor placement"],
      affiliate_fit: 20,
      sponsor_fit: 10,
      lead_capture_fit: 60,
      platform_monetization_fit: 15,
      notes: "Primary goal: stable trust and consistency.",
    },
    stage_2_local_lead: {
      stage,
      current_readiness: 70,
      recommended_actions: ["CTA to DM/form/phone", "Qualify intent in DM", "Track local lead signals by post type"],
      blocked_actions: ["Over-optimized low-quality viral trends"],
      affiliate_fit: 35,
      sponsor_fit: 25,
      lead_capture_fit: 92,
      platform_monetization_fit: 25,
      notes: "Primary monetization stage for KCW.",
    },
    stage_3_affiliate: {
      stage,
      current_readiness: 62,
      recommended_actions: ["Tag affiliate-safe content", "A/B natural mention vs no mention", "Keep educational default"],
      blocked_actions: ["Product-heavy posting pattern"],
      affiliate_fit: 68,
      sponsor_fit: 40,
      lead_capture_fit: 85,
      platform_monetization_fit: 38,
      notes: "Run light affiliate only if trust stays intact.",
    },
    stage_4_sponsor: {
      stage,
      current_readiness: 54,
      recommended_actions: ["Screen sponsor categories", "Set disclosure checklist", "Limit sponsored frequency"],
      blocked_actions: ["Off-category sponsor deals"],
      affiliate_fit: 70,
      sponsor_fit: 72,
      lead_capture_fit: 80,
      platform_monetization_fit: 48,
      notes: "Sponsor fit must never degrade local service image.",
    },
    stage_5_platform: {
      stage,
      current_readiness: 36,
      recommended_actions: ["Track eligibility milestones", "Keep quality-first content strategy"],
      blocked_actions: ["Content made only for payout metrics"],
      affiliate_fit: 74,
      sponsor_fit: 75,
      lead_capture_fit: 78,
      platform_monetization_fit: 70,
      notes: "Supplemental income path, not the core objective.",
    },
  };

  return plans[stage];
}
