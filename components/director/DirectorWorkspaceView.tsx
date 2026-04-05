import DirectorWorkflowActions from "@/components/director/DirectorWorkflowActions";
import { directorStatusLabels } from "@/lib/director/statusMachine";
import type { DirectorCaseBundle } from "@/lib/director/types";

function Module({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-sm text-slate-700">{children}</div>
    </section>
  );
}

function ListBlock({ items }: { items: string[] }) {
  if (!items.length) {
    return <p>-</p>;
  }
  return <ul className="list-disc space-y-1 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function DirectorWorkspaceView({ bundle, disableActions = false }: { bundle: DirectorCaseBundle; disableActions?: boolean }) {
  const c = bundle.case_record;
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-slate-900 p-4 text-white">
        <h1 className="text-2xl font-semibold">{c.case_title}</h1>
        <p className="mt-1 text-sm text-slate-200">Case {c.case_id} · Source {c.source_type} · Status {directorStatusLabels[c.current_status]}</p>
        <p className="mt-1 text-sm text-slate-200">{c.city} · {c.property_type} · Risk {c.risk_level} · Created {c.created_at} · Updated {c.updated_at}</p>
      </section>

      <Module title="Intake Summary">
        <p>Manual intake: {c.job_description || "N/A"}</p>
        <p>Source summary: {c.source_type}{c.source_lead_id ? ` (${c.source_lead_id})` : ""}</p>
        <p>Media summary: {bundle.media.length} items (v1 structured records).</p>
        <p>Operator notes: {c.operator_notes || "N/A"}</p>
      </Module>

      <Module title="Visual Diagnosis">
        {bundle.visual_diagnosis ? (
          <>
            <p>issue_guess: {bundle.visual_diagnosis.issue_guess}</p><p>confidence: {bundle.visual_diagnosis.confidence}</p><p>risk_level: {bundle.visual_diagnosis.risk_level}</p>
            <p className="mt-2">likely_causes:</p><ListBlock items={bundle.visual_diagnosis.likely_causes} />
            <p className="mt-2">immediate_actions:</p><ListBlock items={bundle.visual_diagnosis.immediate_actions} />
            <p className="mt-2">followup_media_needed:</p><ListBlock items={bundle.visual_diagnosis.followup_media_needed} />
            <p>field_visit_recommended: {String(bundle.visual_diagnosis.field_visit_recommended)}</p><p>safety_notice: {bundle.visual_diagnosis.safety_notice}</p><p>available/placeholder tag: {bundle.visual_diagnosis.availability}</p>
          </>
        ) : <p>No analysis yet. available/placeholder tag: placeholder</p>}
      </Module>

      <Module title="Engineering Decision">
        {bundle.engineering_decision ? <><p>job_type: {bundle.engineering_decision.job_type}</p><p>recommended_scope: {bundle.engineering_decision.recommended_scope}</p><p>scope_confidence: {bundle.engineering_decision.scope_confidence}</p><p>engineering_risk: {bundle.engineering_decision.engineering_risk}</p><p>permit_risk: {bundle.engineering_decision.permit_risk}</p><p>code_risk_note: {bundle.engineering_decision.code_risk_note}</p><p>labor.ideal_hours: {bundle.engineering_decision.labor.ideal_hours}</p><p>labor.conservative_hours: {bundle.engineering_decision.labor.conservative_hours}</p><p>labor.crew_size: {bundle.engineering_decision.labor.crew_size}</p><p>senior_review_required: {String(bundle.engineering_decision.senior_review_required)}</p><p>dispatch_strategy: {bundle.engineering_decision.dispatch_strategy}</p><p className="mt-2">workflow_steps:</p><ListBlock items={bundle.engineering_decision.workflow_steps} /></> : <p>No analysis yet.</p>}
      </Module>

      <Module title="Materials & Labor Plan">
        {bundle.materials_labor ? <><p>material_cost_estimate: {bundle.materials_labor.material_cost_estimate}</p><p>labor_cost_estimate: {bundle.materials_labor.labor_cost_estimate}</p><p>labor_notes: {bundle.materials_labor.labor_notes}</p><p className="mt-2">required_materials:</p><ListBlock items={bundle.materials_labor.required_materials} /><p className="mt-2">conditional_materials:</p><ListBlock items={bundle.materials_labor.conditional_materials} /><p className="mt-2">upgrade_materials:</p><ListBlock items={bundle.materials_labor.upgrade_materials} /><p className="mt-2">risky_materials:</p><ListBlock items={bundle.materials_labor.risky_materials} /><p className="mt-2">alternate_materials:</p><ListBlock items={bundle.materials_labor.alternate_materials} /></> : <p>No analysis yet.</p>}
      </Module>

      <Module title="Estimate Builder">
        {bundle.estimate ? <><p>internal_cost: {bundle.estimate.internal_cost}</p><p>market_reference: {bundle.estimate.market_reference}</p><p>kcw_pricing: {bundle.estimate.kcw_pricing}</p><p>pricing_strategy: {bundle.estimate.pricing_strategy}</p><p>notes: {bundle.estimate.notes}</p><p>quote_readiness: {bundle.estimate.quote_readiness}</p></> : <p>No estimate yet.</p>}
      </Module>

      <Module title="Contract Builder">
        {bundle.contract ? <><p>service_scope_draft: {bundle.contract.service_scope_draft}</p><p>warranty_note: {bundle.contract.warranty_note}</p><p>payment_terms: {bundle.contract.payment_terms}</p><p>permit_note: {bundle.contract.permit_note}</p><p>unforeseen_conditions: {bundle.contract.unforeseen_conditions}</p><p>language_mode: {bundle.contract.language_mode}</p><p>available/placeholder tag: {bundle.contract.availability}</p><p className="mt-2">included_items:</p><ListBlock items={bundle.contract.included_items} /><p className="mt-2">excluded_items:</p><ListBlock items={bundle.contract.excluded_items} /></> : <p>Contract draft missing. available/placeholder tag: placeholder</p>}
      </Module>

      <Module title="Permit Review">
        {bundle.permit_review ? <><p>city: {bundle.permit_review.city}</p><p>property_type_context: {bundle.permit_review.property_type_context}</p><p>permit_requirement_verdict: {bundle.permit_review.permit_requirement_verdict}</p><p>permit_status: {bundle.permit_review.permit_status}</p><p>fee_reference: {bundle.permit_review.fee_reference}</p><p>inspection_reference: {bundle.permit_review.inspection_reference}</p><p>manual_verification_needed: {String(bundle.permit_review.manual_verification_needed)}</p><p>city_notes: {bundle.permit_review.city_notes}</p><p>available/placeholder tag: {bundle.permit_review.availability}</p></> : <p>Permit review missing. available/placeholder tag: placeholder</p>}
      </Module>

      <Module title="Procurement Suggestions">
        {bundle.procurement ? <><p>vendor_recommendation: {bundle.procurement.vendor_recommendation}</p><p>urgency_driven_stock_priority: {bundle.procurement.urgency_driven_stock_priority}</p><p>price_reference: {bundle.procurement.price_reference}</p><p>purchase_order_draft: {bundle.procurement.purchase_order_draft}</p><p>availability_note: {bundle.procurement.availability_note}</p><p>available/placeholder tag: {bundle.procurement.availability}</p><p className="mt-2">service_driven_material_hint:</p><ListBlock items={bundle.procurement.service_driven_material_hint} /></> : <p>Procurement suggestions missing. available/placeholder tag: placeholder</p>}
      </Module>

      <Module title="Admin Workflow">
        {disableActions ? <p>Workflow actions disabled in test render.</p> : <DirectorWorkflowActions caseId={c.case_id} />}
      </Module>
    </div>
  );
}
