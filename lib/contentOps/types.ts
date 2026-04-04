export type Platform = "tiktok" | "instagram_reels" | "youtube_shorts" | "rednote" | "facebook_reels";

export type ContentPillar =
  | "common_issues"
  | "mistakes_to_avoid"
  | "real_case"
  | "maintenance"
  | "quote_education"
  | "trust_knowledge"
  | "brand_trust"
  | "local_reminder";

export type LanguageMode = "en" | "zh" | "en_audio_zh_sub" | "zh_audio_en_sub" | "bilingual_caption";

export type VideoFormat =
  | "talking_head"
  | "b_roll_subtitle"
  | "before_after"
  | "maintenance"
  | "faq_quick_answer"
  | "myth_busting"
  | "top_3_tips"
  | "problem_cause_fix"
  | "day_on_job"
  | "dont_do_this"
  | "quote_education"
  | "code_compliance_explainer"
  | "local_service_reminder";

export type FunnelStage = "awareness" | "consideration" | "lead_capture" | "retention";

export type Difficulty = "easy" | "medium" | "hard";
export type ReviewStatus = "draft" | "reviewed" | "approved" | "rejected";

export type ReviewVersion = {
  version_id: string;
  created_at: string;
  updated_by: string;
  status: ReviewStatus;
  notes: string;
  summary: string;
};

export type Topic = {
  id: string;
  title: string;
  pillar: ContentPillar;
  angle: string;
  audience: string;
  platform: Platform[];
  language: LanguageMode;
  difficulty: Difficulty;
  asset_requirements: string[];
  trust_score: number;
  viral_score: number;
  lead_score: number;
  realism_score: number;
  ai_smell_risk: number;
  exaggeration_risk: number;
  duplication_risk: number;
  content_type: "education" | "real_case" | "faq" | "myth" | "maintenance";
  funnel_stage: FunnelStage;
  format_recommendation: VideoFormat;
  case_eligible: boolean;
  status: "draft" | "approved" | "scheduled" | "published";
};

export type ScriptPack = {
  id: string;
  topic_id: string;
  hook_variants: string[];
  main_script: string;
  short_script: string;
  standard_script: string;
  long_script: string;
  on_screen_text: string[];
  voiceover: string;
  subtitle_copy: string;
  caption: string;
  hashtags: string[];
  CTA: string;
  pinned_comment: string;
  reply_seed: string[];
  realism_notes: string;
  human_tone_notes: string;
  ai_smell_risk: number;
  exaggeration_risk: number;
  trustworthiness_score: number;
  rewrite_required: boolean;
  notes: string;
  review_status: ReviewStatus;
  reviewer_notes: string;
  version_history: ReviewVersion[];
};

export type AssetRecord = {
  asset_id: string;
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
  preview_url: string;
  project: string;
  service_type: string;
  tags: string[];
  project_date: string;
  people_visible: boolean;
  customer_sensitive: boolean;
  safe_for_public: boolean;
  language_fit: LanguageMode[];
  best_platform: Platform[];
  can_reuse: boolean;
  quality_score: number;
  reuse_score: number;
  notes: string;
  talking_head_compatible?: boolean;
};

export type InteractionStatus = "open" | "replied" | "waiting" | "escalated" | "closed";

export type InteractionChannel = "comment" | "dm" | "lead";

export type InteractionThread = {
  id: string;
  channel: InteractionChannel;
  related_post_id?: string;
  content_type: string;
  inquiry_type?: string;
  status: InteractionStatus;
  intent_level: "low" | "medium" | "high";
  urgency_level: "low" | "medium" | "high";
  suggested_next_step: string;
  risk_flag: boolean;
  handoff_to_human: boolean;
  last_message: string;
  updated_at: string;
};

export type DuplicationSettings = {
  threshold: number;
  groupByPlatform: boolean;
  groupByLanguage: boolean;
};

export type PostPlan = {
  id: string;
  planned_date: string;
  topic_id: string;
  script_id: string;
  target_platform: Platform;
  format: VideoFormat;
  status: "planned" | "filming" | "editing" | "ready_to_publish" | "published";
  review_status: ReviewStatus;
  reviewer_notes: string;
  version_history: ReviewVersion[];
  publish_notes: string;
  cycle_id: string;
  target_metrics: Record<string, number>;
  actual_metrics: Record<string, number>;
  underperform_flag: boolean;
  underperform_reason_summary: string;
  next_test_plan: string;
};

export type ExecutionStatus = "planned" | "filmed" | "edited" | "posted" | "reviewed";

export type DailyExecution = {
  date: string;
  status: ExecutionStatus;
  comment_replied: boolean;
  dm_processed: boolean;
  high_intent_lead_handoff: boolean;
};

export type MonetizationExecutionLabel =
  | "lead_capture"
  | "affiliate_candidate"
  | "sponsor_safe"
  | "education_only"
  | "platform_growth_only"
  | "local_ad_collab_candidate";

export type PerformanceRecord = {
  post_id: string;
  platform: Platform;
  posted_at: string;
  views: number;
  retention: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  follows: number;
  profile_visits: number;
  dms: number;
  leads: number;
  topic_type: Topic["content_type"];
  format_type: VideoFormat;
  language: LanguageMode;
  posting_time: string;
  analysis_summary: string;
  cycle_id: string;
  goal_met: boolean;
  missed_metrics: string[];
  root_causes: string[];
  optimization_actions: string[];
  next_cycle_strategy: string;
  title: string;
  hook: string;
  script_expression: string;
  structure_signature: string;
};

export type CommentReply = {
  post_id: string;
  comment_type: string;
  reply_style: "concise" | "professional" | "casual" | "dm_guide";
  suggested_reply: string;
  lead_signal: "low" | "medium" | "high";
  urgency_signal: "low" | "medium" | "high";
};

export type DmReply = {
  inquiry_type: string;
  urgency_level: "low" | "medium" | "high";
  response_style: "friendly" | "professional" | "safety_first";
  suggested_reply: string;
  next_required_info: string[];
  lead_score: number;
};

export type MonetizationStage = "stage_1_trust" | "stage_2_local_lead" | "stage_3_affiliate" | "stage_4_sponsor" | "stage_5_platform";

export type MonetizationPlan = {
  stage: MonetizationStage;
  current_readiness: number;
  recommended_actions: string[];
  blocked_actions: string[];
  affiliate_fit: number;
  sponsor_fit: number;
  lead_capture_fit: number;
  platform_monetization_fit: number;
  notes: string;
};

export type CTAType = "lead" | "affiliate" | "sponsor" | "education";

export type ContentMonetizationScore = {
  lead_score: number;
  affiliate_score: number;
  sponsor_score: number;
  trust_risk_score: number;
  commercialization_risk_score: number;
  audience_fit_score: number;
};

export type AffiliateRecommendation = {
  recommended: boolean;
  product_fit_reason: string;
  affiliate_angle: string;
  soft_affiliate_cta: string;
  trust_risk_if_promoted: number;
  product_category: "homeowner_basic_tool" | "drain_maintenance_supply" | "repair_assist_item" | "safe_low_risk_home_repair" | "not_recommended";
  educational_script_variant: string;
  soft_affiliate_script_variant: string;
};

export type SponsorRecommendation = {
  sponsor_safe: boolean;
  brand_fit_reason: string;
  integration_style: string;
  disclosure_required: boolean;
  trust_risk: number;
  sponsor_proposal_draft: string;
  collaboration_angle_suggestion: string;
  local_partner_fit_suggestion: string;
};

export type LocalCollabRecommendation = {
  local_partner_fit: "strong" | "medium" | "weak";
  collaboration_type: "real_estate" | "insurance" | "material_supplier" | "appliance_heater" | "property_management" | "not_recommended";
  likely_risk: string;
  intro_angle: string;
  outreach_draft: string;
};

export type MonetizationExecutionDecision = {
  post_id: string;
  title: string;
  labels: MonetizationExecutionLabel[];
  primary_label: MonetizationExecutionLabel;
  recommended_cta: string;
  cta_type: CTAType;
  lead_capture_route: "DM/form/phone" | "DM/form" | "none";
  authenticity_guard: string;
  blocked_monetization_modes: string[];
  score: ContentMonetizationScore;
  affiliate: AffiliateRecommendation;
  sponsor: SponsorRecommendation;
  local_collab: LocalCollabRecommendation;
};

export type RatioGuardWarning = {
  code: "commercial_overload" | "sponsor_streak" | "affiliate_trust_erosion" | "hard_lead_cta" | "ad_account_risk";
  severity: "low" | "medium" | "high";
  detail: string;
};

export type RatioGuardResult = {
  recommended_ratio: {
    education_only: number;
    lead_capture: number;
    affiliate_candidate: number;
    sponsor_safe: number;
    local_ad_collab_candidate: number;
  };
  actual_ratio: Record<MonetizationExecutionLabel, number>;
  warnings: RatioGuardWarning[];
  suggested_rebalance_plan: string[];
  what_to_reduce: MonetizationExecutionLabel[];
  what_to_increase: MonetizationExecutionLabel[];
};

export type StagePolicy = {
  stage: MonetizationStage;
  stage_name: string;
  primary_revenue_focus: string;
  avoid_revenue_modes: string[];
  recommended_content_ratio: RatioGuardResult["recommended_ratio"];
  recommended_cta_ratio: Record<CTAType, number>;
  commercialization_cap: number;
  forbidden_actions: string[];
};

export type MonetizationFiveDayReview = {
  monetization_summary: string;
  monetization_risk: string;
  next_cycle_monetization_plan: string[];
  lead_performance_5d: number;
  affiliate_candidate_performance_5d: number;
  sponsor_safe_performance_5d: number;
  over_commercialized: boolean;
  natural_content_impact: string;
  next_ratio_recommendation: RatioGuardResult["recommended_ratio"];
};
