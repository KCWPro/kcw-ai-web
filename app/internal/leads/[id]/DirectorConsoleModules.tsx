import type { StoredLead } from "@/lib/internalLeadsStore";
import type { IntakeAnalysisResult } from "@/lib/aiIntakeAnalysis";

function FieldAvailability({ label, value, available }: { label: string; value: string; available: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            available ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {available ? "Available" : "Placeholder"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export default function DirectorConsoleModules({
  lead,
  analysis,
}: {
  lead: StoredLead;
  analysis: IntakeAnalysisResult | null;
}) {
  const hasAnalysis = analysis !== null;
  const riskSummary = hasAnalysis
    ? analysis!.recommended_action
    : "Waiting for AI intake analysis output.";

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Visual Diagnosis</h2>
        <p className="mt-1 text-xs text-slate-600">独立模块：用于记录现场影像诊断结构。不会自动写回报价或状态。</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <FieldAvailability label="Input source" value={lead.customer_notes || "No customer_notes yet."} available />
          <FieldAvailability label="Risk highlight" value={riskSummary} available={hasAnalysis} />
          <FieldAvailability
            label="Photo evidence checklist"
            value="Placeholder: capture sink area, water shutoff valve, floor impact zone, and serial tags."
            available={false}
          />
          <FieldAvailability
            label="Technician photo links"
            value="Placeholder: no photo upload pipeline connected in Director Console v1."
            available={false}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Contract Builder</h2>
        <p className="mt-1 text-xs text-slate-600">独立模块：用于合同草案结构化拼装，当前仅为内部草案展示。</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <FieldAvailability label="Service scope draft" value={lead.service_type || "No service type."} available />
          <FieldAvailability label="Customer legal name" value={lead.customer_name || "Missing customer name."} available />
          <FieldAvailability label="Contract amount" value={lead.quote_amount || "Placeholder: quote not confirmed yet."} available={Boolean(lead.quote_amount)} />
          <FieldAvailability
            label="Signature block"
            value="Placeholder: e-sign integration not connected. Manual legal review required."
            available={false}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Permit Review</h2>
        <p className="mt-1 text-xs text-slate-600">独立模块：用于许可审查准备，不自动提交政府许可。</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <FieldAvailability label="Project city" value={lead.city || "Missing city."} available />
          <FieldAvailability label="Property type context" value={lead.property_type || "Placeholder: property type not provided."} available={Boolean(lead.property_type)} />
          <FieldAvailability
            label="Permit requirement verdict"
            value="Placeholder: jurisdiction-specific permit rules engine not connected."
            available={false}
          />
          <FieldAvailability
            label="Permit packet status"
            value="Placeholder: no permit packet generator in v1."
            available={false}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Procurement Suggestions</h2>
        <p className="mt-1 text-xs text-slate-600">独立模块：用于采购建议草案，当前不触发采购单。</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <FieldAvailability label="Service-driven material hint" value={lead.service_type || "No service type."} available />
          <FieldAvailability label="Urgency-driven stock priority" value={lead.urgency ? `${lead.urgency} urgency` : "No urgency level."} available />
          <FieldAvailability
            label="Vendor recommendation"
            value="Placeholder: vendor pricing feed not connected."
            available={false}
          />
          <FieldAvailability
            label="Purchase order draft"
            value="Placeholder: PO export and approval chain not connected."
            available={false}
          />
        </div>
      </div>
    </section>
  );
}
