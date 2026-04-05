export const DIRECTOR_STATUSES = [
  "draft",
  "intake_ready",
  "ai_analysis_ready",
  "engineering_review_ready",
  "estimate_ready",
  "contract_ready",
  "permit_review_pending",
  "procurement_review_pending",
  "site_visit_needed",
  "completed",
  "archived",
] as const;

export type DirectorCaseStatus = (typeof DIRECTOR_STATUSES)[number];

export type DirectorRiskLevel = "low" | "medium" | "high";
export type DirectorQuoteReadiness = "not_ready" | "needs_review" | "ready";
export type DirectorSourceType = "manual" | "imported_lead";
export type AvailabilityTag = "available" | "placeholder" | "conditional";

export type DirectorCaseRecord = {
  case_id: string;
  source_type: DirectorSourceType;
  source_lead_id: string | null;
  case_title: string;
  customer_name: string;
  phone: string;
  email: string;
  service_address: string;
  city: string;
  zip_code: string;
  property_type: string;
  residential_or_commercial: "residential" | "commercial" | "unknown";
  urgency_level: "low" | "medium" | "high";
  job_category: string;
  job_description: string;
  scope_notes: string;
  known_symptoms: string;
  known_constraints: string;
  target_equipment_system: string;
  permit_already_exists: "yes" | "no" | "unknown";
  inspection_expected: "yes" | "no" | "unknown";
  access_difficulty: "easy" | "moderate" | "hard" | "unknown";
  house_age_type: "old" | "new" | "unknown";
  leak_present: boolean;
  gas_involved: boolean;
  drain_involved: boolean;
  water_heater_involved: boolean;
  repipe_related: boolean;
  commercial_fixture_related: boolean;
  operator_notes: string;
  plan_sketch_refs: string;
  current_status: DirectorCaseStatus;
  risk_level: DirectorRiskLevel;
  quote_readiness: DirectorQuoteReadiness;
  created_at: string;
  updated_at: string;
};

export type DirectorMediaRecord = {
  media_id: string;
  case_id: string;
  media_type: "photo" | "video" | "file_ref";
  file_name: string;
  file_url_ref: string;
  clarity: "clear" | "unclear" | "unknown";
  notes: string;
  followup_requested: boolean;
};

export type DirectorVisualDiagnosisRecord = {
  case_id: string;
  issue_guess: string;
  confidence: number;
  risk_level: DirectorRiskLevel;
  likely_causes: string[];
  immediate_actions: string[];
  followup_media_needed: string[];
  field_visit_recommended: boolean;
  safety_notice: string;
  availability: AvailabilityTag;
};

export type DirectorEngineeringDecisionRecord = {
  case_id: string;
  job_type: string;
  recommended_scope: string;
  scope_confidence: number;
  engineering_risk: DirectorRiskLevel;
  permit_risk: DirectorRiskLevel;
  code_risk_note: string;
  workflow_steps: string[];
  labor: {
    ideal_hours: number;
    conservative_hours: number;
    crew_size: number;
  };
  senior_review_required: boolean;
  dispatch_strategy: string;
};

export type DirectorMaterialsLaborRecord = {
  case_id: string;
  required_materials: string[];
  conditional_materials: string[];
  upgrade_materials: string[];
  risky_materials: string[];
  alternate_materials: string[];
  material_cost_estimate: number;
  labor_cost_estimate: number;
  labor_notes: string;
};

export type DirectorEstimateRecord = {
  case_id: string;
  internal_cost: number;
  market_reference: string;
  kcw_pricing: number;
  pricing_strategy: string;
  notes: string;
  quote_readiness: DirectorQuoteReadiness;
};

export type DirectorContractRecord = {
  case_id: string;
  service_scope_draft: string;
  included_items: string[];
  excluded_items: string[];
  warranty_note: string;
  payment_terms: string;
  permit_note: string;
  unforeseen_conditions: string;
  language_mode: "english" | "bilingual";
  availability: AvailabilityTag;
};

export type DirectorPermitReviewRecord = {
  case_id: string;
  city: string;
  property_type_context: string;
  permit_requirement_verdict: string;
  permit_status: "not_started" | "needs_review" | "verified";
  fee_reference: string;
  inspection_reference: string;
  manual_verification_needed: boolean;
  city_notes: string;
  availability: AvailabilityTag;
};

export type DirectorProcurementRecord = {
  case_id: string;
  service_driven_material_hint: string[];
  urgency_driven_stock_priority: "low" | "medium" | "high";
  vendor_recommendation: string;
  price_reference: string;
  purchase_order_draft: string;
  availability_note: string;
  availability: AvailabilityTag;
};

export type DirectorActionLog = {
  action_id: string;
  case_id: string;
  action: string;
  note: string;
  created_at: string;
};

export type DirectorCaseBundle = {
  case_record: DirectorCaseRecord;
  media: DirectorMediaRecord[];
  visual_diagnosis: DirectorVisualDiagnosisRecord | null;
  engineering_decision: DirectorEngineeringDecisionRecord | null;
  materials_labor: DirectorMaterialsLaborRecord | null;
  estimate: DirectorEstimateRecord | null;
  contract: DirectorContractRecord | null;
  permit_review: DirectorPermitReviewRecord | null;
  procurement: DirectorProcurementRecord | null;
  actions: DirectorActionLog[];
};

export type CreateDirectorCaseInput = Omit<
  DirectorCaseRecord,
  "case_id" | "created_at" | "updated_at" | "current_status" | "risk_level" | "quote_readiness"
> & { requested_status?: DirectorCaseStatus };
