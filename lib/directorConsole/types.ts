import type { DirectorLeadStatus } from "./status";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type FutureIntegrationBoundary = {
  external_lead_id?: string;
  source_type?: string;
  source_platform?: string;
  source_submission_payload?: string;
  source_media_ref?: string;
  intake_timestamp?: string;
  customer_visible_status?: string;
  outbound_message_ref?: string;
  future_callback_status?: string;
};

export type MediaAsset = {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail_url?: string;
  clarity: "clear" | "unclear";
  focus_area: string;
  retake_requested: boolean;
  suspicious_points: string[];
  key_frames?: Array<{ timestamp: string; note: string; frame_url?: string }>;
};

export type VisualDiagnosisRecord = {
  issue_guess: string;
  confidence: number;
  risk_level: RiskLevel;
  likely_causes: string[];
  immediate_actions: string[];
  followup_media_needed: string[];
  quote_readiness: "ready" | "need_more_media" | "need_site_visit";
  field_visit_recommended: boolean;
  permit_risk_precheck: string;
  safety_notice: string;
  internal_summary: string;
};

export type MaterialRecommendationRecord = {
  required: string[];
  conditional: string[];
  upgrade: string[];
  risky: string[];
  alternate: string[];
};

export type EngineeringDecisionRecord = {
  job_type: string;
  recommended_scope: string;
  scope_confidence: number;
  engineering_risk: RiskLevel;
  permit_risk: "likely_required" | "likely_not_required" | "city_review_needed" | "manual_verification_required";
  code_risk_note: string;
  materials: MaterialRecommendationRecord;
  workflow_steps: string[];
  labor: { ideal_hours: number; conservative_hours: number; crew_size: number };
  dispatch_strategy: string;
  senior_review_required: boolean;
  internal_summary: string;
};

export type EstimateRecord = {
  internal_cost: { materials: number; labor: number; permit: number; disposal: number; travel: number; contingency: number; total: number };
  market_reference: { low: number; high: number };
  kcw_pricing: { standard: number; quick_close: number; high_risk: number; loyal_customer: number };
  pricing_strategy: string;
  notes: string;
};

export type ContractRecord = {
  language_mode: "zh" | "en" | "bilingual";
  estimate_draft: string;
  contract_draft: string;
  exclusions: string;
  warranty_note: string;
  payment_terms: string;
  permit_note: string;
  unforeseen_condition_note: string;
};

export type PermitReviewRecord = {
  city: string;
  job_type: string;
  permit_status_recommendation: "likely_required" | "likely_not_required" | "city_review_needed" | "manual_verification_required";
  official_portal_url?: string;
  fee_page_url?: string;
  inspection_url?: string;
  city_notes: string;
  internal_warning: string;
  needs_manual_verification: boolean;
};

export type ProcurementSuggestionRecord = {
  item_name: string;
  preferred_vendor: string;
  alt_vendor: string;
  price_reference: string;
  pickup_option: string;
  availability_note: string;
  procurement_strategy: string;
  notes: string;
};

export type InternalActionLog = {
  id: string;
  action: string;
  from_status: DirectorLeadStatus;
  to_status: DirectorLeadStatus;
  at: string;
  by: string;
  note?: string;
};

export type LeadMasterRecord = FutureIntegrationBoundary & {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  address?: string;
  service_type: string;
  issue_summary: string;
  urgency: "low" | "medium" | "high";
  status: DirectorLeadStatus;
  ai_initial_classification: string;
  risk_level: RiskLevel;
  created_at: string;
  media_assets: MediaAsset[];
  visual_diagnosis: VisualDiagnosisRecord;
  engineering_decision: EngineeringDecisionRecord;
  estimate: EstimateRecord;
  contract: ContractRecord;
  permit_review: PermitReviewRecord;
  procurement_suggestions: ProcurementSuggestionRecord[];
  internal_action_log: InternalActionLog[];
};
