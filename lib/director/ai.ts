import type {
  DirectorCaseRecord,
  DirectorContractRecord,
  DirectorEngineeringDecisionRecord,
  DirectorEstimateRecord,
  DirectorMaterialsLaborRecord,
  DirectorPermitReviewRecord,
  DirectorProcurementRecord,
  DirectorVisualDiagnosisRecord,
} from "@/lib/director/types";

export type DirectorAiOutputBundle = {
  visual_diagnosis: DirectorVisualDiagnosisRecord;
  engineering_decision: DirectorEngineeringDecisionRecord;
  materials_labor: DirectorMaterialsLaborRecord;
  estimate: DirectorEstimateRecord;
  contract: DirectorContractRecord;
  permit_review: DirectorPermitReviewRecord;
  procurement: DirectorProcurementRecord;
};

export function buildDirectorAiOutputs(caseRecord: DirectorCaseRecord): DirectorAiOutputBundle {
  const likelyEmergency = caseRecord.urgency_level === "high" || caseRecord.leak_present || caseRecord.gas_involved;
  const risk = likelyEmergency ? "high" : caseRecord.permit_already_exists === "unknown" ? "medium" : "low";

  const visual: DirectorVisualDiagnosisRecord = {
    case_id: caseRecord.case_id,
    issue_guess: caseRecord.known_symptoms || caseRecord.job_description || "现场信息不足，需要补充影像。",
    confidence: likelyEmergency ? 0.82 : 0.61,
    risk_level: risk,
    likely_causes: [
      caseRecord.drain_involved ? "排水系统阻塞或坡度异常" : "供水部件老化",
      caseRecord.leak_present ? "连接点密封失效" : "设备工况不稳定",
    ],
    immediate_actions: ["安排电话确认现场风险", "准备基础安全隔离指引"],
    followup_media_needed: ["设备铭牌近照", "作业区域全景", "关键连接点近照"],
    field_visit_recommended: likelyEmergency,
    safety_notice: likelyEmergency ? "存在即时风险，建议优先派工。" : "可先进行远程确认后排程。",
    availability: "available",
  };

  const engineering: DirectorEngineeringDecisionRecord = {
    case_id: caseRecord.case_id,
    job_type: caseRecord.job_category || "General Plumbing",
    recommended_scope: caseRecord.scope_notes || "先进行现场诊断，再确认最终施工范围。",
    scope_confidence: 0.7,
    engineering_risk: risk,
    permit_risk: caseRecord.permit_already_exists === "yes" ? "low" : "medium",
    code_risk_note: "需按城市规范复核尺寸、材质与检测流程。",
    workflow_steps: ["Intake Validation", "Field Verification", "Engineering Scope Freeze", "Cost Review"],
    labor: {
      ideal_hours: caseRecord.repipe_related ? 8 : 4,
      conservative_hours: caseRecord.repipe_related ? 14 : 7,
      crew_size: caseRecord.residential_or_commercial === "commercial" ? 3 : 2,
    },
    senior_review_required: risk === "high",
    dispatch_strategy: likelyEmergency ? "Priority dispatch within 4 hours" : "Schedule in next available slot",
  };

  const materials: DirectorMaterialsLaborRecord = {
    case_id: caseRecord.case_id,
    required_materials: ["Shutoff valve set", "Connector fittings"],
    conditional_materials: ["Backup drain assembly", "Inspection camera rental"],
    upgrade_materials: ["High-efficiency fixture kit"],
    risky_materials: ["Legacy fitting conversion adapter"],
    alternate_materials: ["Equivalent brand valve series"],
    material_cost_estimate: caseRecord.repipe_related ? 1200 : 420,
    labor_cost_estimate: caseRecord.repipe_related ? 2400 : 980,
    labor_notes: "人工估算基于当前描述，现场确认后自动回写。",
  };

  const estimate: DirectorEstimateRecord = {
    case_id: caseRecord.case_id,
    internal_cost: materials.material_cost_estimate + materials.labor_cost_estimate,
    market_reference: "Sacramento regional baseline (offline snapshot)",
    kcw_pricing: Math.round((materials.material_cost_estimate + materials.labor_cost_estimate) * 1.38),
    pricing_strategy: "Risk-adjusted tiered pricing",
    notes: "含应急响应与复检缓冲，支持经理二次审核。",
    quote_readiness: risk === "high" ? "needs_review" : "ready",
  };

  const contract: DirectorContractRecord = {
    case_id: caseRecord.case_id,
    service_scope_draft: `${engineering.recommended_scope}，并执行完整验收与交付记录。`,
    included_items: ["基础施工", "系统复测", "交付说明"],
    excluded_items: ["墙体恢复", "第三方专项检测"],
    warranty_note: "标准保修 12 个月，耗材按厂商条款执行。",
    payment_terms: "50% deposit + 50% completion",
    permit_note: "Permit 结论需在开工前最终确认。",
    unforeseen_conditions: "若发现隐蔽损坏，需变更单审批后继续。",
    language_mode: "bilingual",
    availability: "available",
  };

  const permit: DirectorPermitReviewRecord = {
    case_id: caseRecord.case_id,
    city: caseRecord.city,
    property_type_context: `${caseRecord.property_type} / ${caseRecord.residential_or_commercial}`,
    permit_requirement_verdict: caseRecord.repipe_related || caseRecord.gas_involved ? "likely_required" : "conditional",
    permit_status: "needs_review",
    fee_reference: "City fee table (manual verification required)",
    inspection_reference: caseRecord.inspection_expected === "yes" ? "Inspection expected by intake" : "No confirmed inspection yet",
    manual_verification_needed: true,
    city_notes: "v1 uses structured offline references; confirm with city portal before filing.",
    availability: "conditional",
  };

  const procurement: DirectorProcurementRecord = {
    case_id: caseRecord.case_id,
    service_driven_material_hint: materials.required_materials,
    urgency_driven_stock_priority: caseRecord.urgency_level,
    vendor_recommendation: "Primary: KCW Central Supplier / Backup: Local Trade Counter",
    price_reference: "Last internal purchase snapshot (offline)",
    purchase_order_draft: `PO draft for ${caseRecord.case_title || caseRecord.customer_name}`,
    availability_note: "Real-time stock API unavailable in v1; verify manually before purchase.",
    availability: "placeholder",
  };

  return {
    visual_diagnosis: visual,
    engineering_decision: engineering,
    materials_labor: materials,
    estimate,
    contract,
    permit_review: permit,
    procurement,
  };
}
