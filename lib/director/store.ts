import { internalLeads, type KcwLead } from "@/lib/internalLeads";
import { buildDirectorAiOutputs } from "@/lib/director/ai";
import { canTransitionDirectorStatus } from "@/lib/director/statusMachine";
import type {
  CreateDirectorCaseInput,
  DirectorActionLog,
  DirectorCaseBundle,
  DirectorCaseRecord,
  DirectorCaseStatus,
  DirectorMediaRecord,
} from "@/lib/director/types";

type DirectorStore = {
  cases: Map<string, DirectorCaseBundle>;
};

const globalKey = "__kcwDirectorStoreV1";

function nowIso() {
  return new Date().toISOString();
}

function inferRisk(input: CreateDirectorCaseInput): DirectorCaseRecord["risk_level"] {
  if (input.gas_involved || input.leak_present || input.urgency_level === "high") {
    return "high";
  }
  if (input.permit_already_exists === "unknown" || input.known_constraints.length > 0) {
    return "medium";
  }
  return "low";
}

function createCaseId() {
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DIR-${token}`;
}

function createAction(caseId: string, action: string, note: string): DirectorActionLog {
  return {
    action_id: `ACT-${Math.random().toString(36).slice(2, 9)}`,
    case_id: caseId,
    action,
    note,
    created_at: nowIso(),
  };
}

function createSeedCase(): DirectorCaseBundle {
  const created = "2026-04-01T09:30:00.000Z";
  const caseRecord: DirectorCaseRecord = {
    case_id: "DIR-SEED-1001",
    source_type: "manual",
    source_lead_id: null,
    case_title: "Emergency Leak Stabilization - Midtown Duplex",
    customer_name: "Seed Operator",
    phone: "(916) 555-0100",
    email: "seed@kcw.local",
    service_address: "1300 Q St",
    city: "Sacramento",
    zip_code: "95811",
    property_type: "duplex",
    residential_or_commercial: "residential",
    urgency_level: "high",
    job_category: "Leak Repair",
    job_description: "Second-floor supply leak with ceiling damage signs.",
    scope_notes: "stabilize leak + assess repipe risk",
    known_symptoms: "active dripping + pressure drop",
    known_constraints: "tenant occupied",
    target_equipment_system: "copper supply line",
    permit_already_exists: "no",
    inspection_expected: "yes",
    access_difficulty: "moderate",
    house_age_type: "old",
    leak_present: true,
    gas_involved: false,
    drain_involved: false,
    water_heater_involved: false,
    repipe_related: true,
    commercial_fixture_related: false,
    operator_notes: "Need bilingual summary for tenant communication.",
    plan_sketch_refs: "photo_batch_2026_04_01",
    current_status: "engineering_review_ready",
    risk_level: "high",
    quote_readiness: "needs_review",
    created_at: created,
    updated_at: created,
  };

  const outputs = buildDirectorAiOutputs(caseRecord);

  return {
    case_record: caseRecord,
    media: [
      {
        media_id: "MED-1",
        case_id: caseRecord.case_id,
        media_type: "photo",
        file_name: "kitchen_ceiling.jpg",
        file_url_ref: "local://kitchen_ceiling.jpg",
        clarity: "clear",
        notes: "visible moisture marks",
        followup_requested: false,
      },
    ],
    ...outputs,
    actions: [createAction(caseRecord.case_id, "seed_created", "Seed case for director dashboard and queue")],
  };
}

function mapLeadToInput(lead: KcwLead): CreateDirectorCaseInput {
  return {
    source_type: "imported_lead",
    source_lead_id: lead.id,
    case_title: `${lead.service_type} - ${lead.city}`,
    customer_name: lead.customer_name,
    phone: lead.phone,
    email: "",
    service_address: "",
    city: lead.city,
    zip_code: "",
    property_type: "unknown",
    residential_or_commercial: "unknown",
    urgency_level: lead.urgency,
    job_category: lead.service_type,
    job_description: lead.intake_raw,
    scope_notes: lead.suggested_next_step,
    known_symptoms: lead.ai_summary,
    known_constraints: "",
    target_equipment_system: "",
    permit_already_exists: "unknown",
    inspection_expected: "unknown",
    access_difficulty: "unknown",
    house_age_type: "unknown",
    leak_present: lead.service_type.toLowerCase().includes("leak"),
    gas_involved: false,
    drain_involved: lead.service_type.toLowerCase().includes("drain"),
    water_heater_involved: lead.service_type.toLowerCase().includes("heater"),
    repipe_related: lead.service_type.toLowerCase().includes("reroute"),
    commercial_fixture_related: false,
    operator_notes: `Imported from lead ${lead.id}`,
    plan_sketch_refs: "",
  };
}

function getStore(): DirectorStore {
  const runtime = globalThis as typeof globalThis & { [globalKey]?: DirectorStore };
  if (!runtime[globalKey]) {
    const initial = new Map<string, DirectorCaseBundle>();
    const seed = createSeedCase();
    initial.set(seed.case_record.case_id, seed);
    runtime[globalKey] = { cases: initial };
  }
  return runtime[globalKey] as DirectorStore;
}

export function listDirectorCases(): DirectorCaseBundle[] {
  return Array.from(getStore().cases.values()).sort((a, b) => (a.case_record.updated_at < b.case_record.updated_at ? 1 : -1));
}

export function getDirectorCaseById(id: string): DirectorCaseBundle | null {
  return getStore().cases.get(id) ?? null;
}

export function createDirectorCase(input: CreateDirectorCaseInput): DirectorCaseBundle {
  const timestamp = nowIso();
  const caseId = createCaseId();

  const caseRecord: DirectorCaseRecord = {
    ...input,
    case_id: caseId,
    current_status: input.requested_status ?? "draft",
    risk_level: inferRisk(input),
    quote_readiness: "not_ready",
    created_at: timestamp,
    updated_at: timestamp,
  };

  const media: DirectorMediaRecord[] = [];
  const bundle: DirectorCaseBundle = {
    case_record: caseRecord,
    media,
    visual_diagnosis: null,
    engineering_decision: null,
    materials_labor: null,
    estimate: null,
    contract: null,
    permit_review: null,
    procurement: null,
    actions: [createAction(caseId, "case_created", `Case created from ${input.source_type}`)],
  };

  getStore().cases.set(caseId, bundle);
  return bundle;
}

export function importDirectorCaseFromLead(leadId: string): DirectorCaseBundle | null {
  const lead = internalLeads.find((item) => item.id === leadId);
  if (!lead) {
    return null;
  }
  return createDirectorCase(mapLeadToInput(lead));
}

export function runDirectorAiAnalysis(caseId: string): DirectorCaseBundle | null {
  const bundle = getDirectorCaseById(caseId);
  if (!bundle) {
    return null;
  }

  const outputs = buildDirectorAiOutputs(bundle.case_record);
  const nextStatus: DirectorCaseStatus = "ai_analysis_ready";
  bundle.case_record.current_status = nextStatus;
  bundle.case_record.quote_readiness = outputs.estimate.quote_readiness;
  bundle.case_record.updated_at = nowIso();
  bundle.visual_diagnosis = outputs.visual_diagnosis;
  bundle.engineering_decision = outputs.engineering_decision;
  bundle.materials_labor = outputs.materials_labor;
  bundle.estimate = outputs.estimate;
  bundle.contract = outputs.contract;
  bundle.permit_review = outputs.permit_review;
  bundle.procurement = outputs.procurement;
  bundle.actions.unshift(createAction(caseId, "ai_analysis_run", "Structured AI outputs refreshed"));

  return bundle;
}

export function updateDirectorCaseStatus(caseId: string, target: DirectorCaseStatus): DirectorCaseBundle | null {
  const bundle = getDirectorCaseById(caseId);
  if (!bundle) {
    return null;
  }

  const from = bundle.case_record.current_status;
  if (!canTransitionDirectorStatus(from, target) && from !== target) {
    return null;
  }

  bundle.case_record.current_status = target;
  bundle.case_record.updated_at = nowIso();
  bundle.actions.unshift(createAction(caseId, "status_updated", `${from} -> ${target}`));
  return bundle;
}

export function getDirectorDashboardSnapshot() {
  const all = listDirectorCases();
  const byStatus = (status: DirectorCaseStatus) => all.filter((item) => item.case_record.current_status === status).length;
  return {
    total_cases: all.length,
    new_cases: byStatus("draft") + byStatus("intake_ready"),
    pending_ai_analysis: byStatus("intake_ready") + byStatus("draft"),
    pending_engineering: byStatus("engineering_review_ready") + byStatus("ai_analysis_ready"),
    pending_quote: byStatus("estimate_ready"),
    pending_contract: byStatus("contract_ready"),
    pending_permit_review: byStatus("permit_review_pending"),
    pending_procurement_review: byStatus("procurement_review_pending"),
    high_risk_cases: all.filter((item) => item.case_record.risk_level === "high").length,
    recent_cases: all.slice(0, 5).map((item) => item.case_record),
  };
}
