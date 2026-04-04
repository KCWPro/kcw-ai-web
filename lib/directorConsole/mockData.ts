import { directorLeadStatuses, type DirectorLeadStatus } from "./status";
import type { LeadMasterRecord, MediaAsset, VisualDiagnosisRecord, EngineeringDecisionRecord } from "./types";

type RawLead = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  service_type: string;
  urgency: string;
  status: string;
  created_at?: string;
  customer_notes?: string;
  ai_summary?: string;
  source?: string;
};

const statusMap: Record<string, DirectorLeadStatus> = {
  new: "new",
  follow_up: "follow_up_pending",
  quoted: "contract_pending",
  scheduled: "site_visit_recommended",
  completed: "closed_won",
  archived: "archived",
};

function pick<T>(values: T[], seed: number): T {
  return values[seed % values.length];
}

export function toDirectorLead(raw: RawLead, index: number): LeadMasterRecord {
  const urgency = raw.urgency === "high" || raw.urgency === "low" ? raw.urgency : "medium";
  const risk = urgency === "high" ? "high" : urgency === "medium" ? "medium" : "low";
  const mappedStatus = statusMap[raw.status] ?? pick([...directorLeadStatuses], index);

  const media_assets: MediaAsset[] = [
    {
      id: `${raw.id}-photo-1`,
      type: "photo",
      url: "/next.svg",
      clarity: index % 3 === 0 ? "unclear" : "clear",
      focus_area: "Leak source / damage zone",
      retake_requested: index % 3 === 0,
      suspicious_points: ["joint corrosion", "possible hidden moisture"],
    },
    {
      id: `${raw.id}-video-1`,
      type: "video",
      url: "/file.svg",
      thumbnail_url: "/window.svg",
      clarity: "clear",
      focus_area: "Pipe vibration / flow noise",
      retake_requested: false,
      suspicious_points: ["intermittent pressure spike"],
      key_frames: [
        { timestamp: "00:03", note: "入口区域全景" },
        { timestamp: "00:11", note: "疑似渗漏点近景" },
      ],
    },
  ];

  const visual_diagnosis: VisualDiagnosisRecord = {
    issue_guess: `初步判断：${raw.service_type} related issue`,
    confidence: urgency === "high" ? 0.74 : 0.66,
    risk_level: risk,
    likely_causes: ["Aging joint/seal", "Installation wear", "Pressure fluctuation"],
    immediate_actions: ["建议先做现场安全确认", "建议隔离风险区域并记录读数"],
    followup_media_needed: ["补拍近距离接口细节", "补拍设备铭牌/规格", "补拍受影响区域全景"],
    quote_readiness: index % 3 === 0 ? "need_more_media" : "ready",
    field_visit_recommended: urgency === "high" || index % 4 === 0,
    permit_risk_precheck: "内部预检：可能涉及 city permit，需人工二次核实。",
    safety_notice: "仅内部初步视觉建议，不构成最终工程或法律结论。",
    internal_summary: "该结论为初步视觉诊断，建议结合工程判断与人工复核后执行。",
  };

  const engineering_decision: EngineeringDecisionRecord = {
    job_type: raw.service_type,
    recommended_scope: "现场复核 -> 定位问题 -> 执行修复/替换 -> 完工测试",
    scope_confidence: visual_diagnosis.quote_readiness === "ready" ? 0.72 : 0.58,
    engineering_risk: risk,
    permit_risk: raw.city === "Sacramento" ? "city_review_needed" : "manual_verification_required",
    code_risk_note: "Code/permit 为内部工程提示，需由人工及城市官网再次确认。",
    materials: {
      required: ["Primary replacement fittings", "Sealant / gasket"],
      conditional: ["Additional coupling", "Isolation valve"],
      upgrade: ["Higher durability valve"],
      risky: ["Legacy mismatched connector"],
      alternate: ["Equivalent spec kit"],
    },
    workflow_steps: ["Media+intake review", "Engineering validation", "Cost build", "Permit check", "Final approval"],
    labor: { ideal_hours: 4, conservative_hours: 7, crew_size: urgency === "high" ? 3 : 2 },
    dispatch_strategy: urgency === "high" ? "优先派高阶技师 + 同日响应" : "常规派工并保留现场升级策略",
    senior_review_required: urgency === "high" || risk === "high",
    internal_summary: "工程建议为内部决策草案，落地前需人工确认现场条件。",
  };

  const materials = 950;
  const labor = engineering_decision.labor.conservative_hours * 135;
  const permit = engineering_decision.permit_risk === "likely_not_required" ? 0 : 180;
  const disposal = 120;
  const travel = 80;
  const contingency = 240;
  const total = materials + labor + permit + disposal + travel + contingency;

  const estimate = {
    internal_cost: { materials, labor, permit, disposal, travel, contingency, total },
    market_reference: { low: Math.round(total * 1.1), high: Math.round(total * 1.4) },
    kcw_pricing: {
      standard: Math.round(total * 1.32),
      quick_close: Math.round(total * 1.24),
      high_risk: Math.round(total * 1.48),
      loyal_customer: Math.round(total * 1.18),
    },
    pricing_strategy: "内部建议按 standard 为主；高风险或现场复杂度提升时切换 high_risk。",
    notes: "当前报价为内部估算，未接入实时市场价格源。",
  };

  const contract = {
    language_mode: "bilingual" as const,
    estimate_draft: `Estimate Draft\nLead: ${raw.id}\nScope: ${engineering_decision.recommended_scope}\nRecommended price: $${estimate.kcw_pricing.standard}`,
    contract_draft: `Contract Draft\nService Type: ${raw.service_type}\nCity: ${raw.city}\nThis draft is for internal review only.`,
    exclusions: "Excludes concealed condition correction, structural modification, and third-party utility relocation.",
    warranty_note: "Workmanship warranty subject to finalized scope and verified site condition.",
    payment_terms: "50% deposit, 40% substantial completion, 10% final sign-off.",
    permit_note: "Permit requirement is an internal pre-check result and must be manually verified.",
    unforeseen_condition_note: "Unforeseen conditions may trigger scope/cost update after customer approval.",
  };

  const permit_review = {
    city: raw.city,
    job_type: engineering_decision.job_type,
    permit_status_recommendation: engineering_decision.permit_risk,
    official_portal_url: "",
    fee_page_url: "",
    inspection_url: "",
    city_notes: "城市规则本阶段未实时联网，需人工核对 portal 与 fee 页面。",
    internal_warning: "Permit 结论仅供内部建议，不可直接作为正式法务意见。",
    needs_manual_verification: true,
  };

  const procurement_suggestions = engineering_decision.materials.required.map((item, i) => ({
    item_name: item,
    preferred_vendor: i % 2 === 0 ? "Home Depot Pro" : "Ferguson",
    alt_vendor: i % 2 === 0 ? "Ferguson" : "Grainger",
    price_reference: "$120 - $380 (internal benchmark)",
    pickup_option: "same-day pickup if in stock",
    availability_note: "本阶段无实时库存接口，需人工电话确认。",
    procurement_strategy: "优先采购 required，conditional 在现场核验后补采。",
    notes: "采购建议来源于工程材料树，不会自动下单。",
  }));

  return {
    id: raw.id,
    customer_name: raw.customer_name,
    phone: raw.phone,
    city: raw.city,
    address: `${raw.city} service area`,
    service_type: raw.service_type,
    issue_summary: raw.customer_notes || raw.ai_summary || raw.service_type,
    urgency,
    status: mappedStatus,
    ai_initial_classification: raw.ai_summary || "Intake classification pending",
    risk_level: risk,
    created_at: raw.created_at || new Date().toISOString(),
    media_assets,
    visual_diagnosis,
    engineering_decision,
    estimate,
    contract,
    permit_review,
    procurement_suggestions,
    internal_action_log: [],
    external_lead_id: raw.id,
    source_type: "intake_form",
    source_platform: raw.source || "website",
    source_submission_payload: "reserved",
    source_media_ref: "reserved",
    intake_timestamp: raw.created_at || new Date().toISOString(),
    customer_visible_status: "reserved",
    outbound_message_ref: "reserved",
    future_callback_status: "reserved",
  };
}

export function toDirectorLeads(rawLeads: RawLead[]): LeadMasterRecord[] {
  return rawLeads.map((lead, index) => toDirectorLead(lead, index));
}
