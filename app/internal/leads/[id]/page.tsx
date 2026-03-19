import Link from "next/link";
import { notFound } from "next/navigation";
import { statusLabels } from "@/lib/internalLeads";
import { readInternalLeadByIdFromGoogleSheet } from "@/lib/internalLeadsStore";
import LeadStatusUpdater from "./LeadStatusUpdater";
import LeadNotesEditor from "./LeadNotesEditor";
import { buildIntakeAnalysis, type IntakeAnalysisResult } from "@/lib/aiIntakeAnalysis";
import { buildOperatorGuidance, type OperatorGuidanceLevel } from "@/lib/internalOperatorGuidance";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <p>
      <span className="font-medium text-slate-500">{label}:</span> {value || "-"}
    </p>
  );
}

function AnalysisField({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-6 text-slate-700">
      <span className="font-medium text-slate-500">{label}:</span> {value}
    </p>
  );
}

function formatUsd(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function IntakeAnalysisSection({ analysis, isFallback }: { analysis: IntakeAnalysisResult | null; isFallback: boolean }) {
  if (!analysis) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">AI Intake Analysis</h2>
        <p className="mt-3 text-sm leading-6 text-amber-800">
          AI analysis is temporarily unavailable. Lead detail data remains available. Please refresh later.
        </p>
      </div>
    );
  }

  const missingFields = analysis.missing_fields.length > 0 ? analysis.missing_fields.join(", ") : "None";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">AI Intake Analysis</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Read-only</span>
      </div>

      {isFallback ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Analysis is served with safe degradation mode due to runtime issue.
        </p>
      ) : null}

      <div className="mt-3 space-y-1">
        <AnalysisField label="issue_classification" value={analysis.issue_classification} />
        <AnalysisField label="info_completeness" value={analysis.info_completeness} />
        <AnalysisField label="missing_fields" value={missingFields} />
        <AnalysisField label="recommended_action" value={analysis.recommended_action} />
        <AnalysisField
          label="suggested_price_range"
          value={`${analysis.suggested_price_range.band} (${formatUsd(analysis.suggested_price_range.min)} - ${formatUsd(analysis.suggested_price_range.max)})`}
        />
        <AnalysisField label="price_notes" value={analysis.suggested_price_range.notes} />
        <AnalysisField label="next_step" value={analysis.next_step} />
        <AnalysisField label="confidence" value={analysis.confidence.toFixed(2)} />
        <AnalysisField label="analysis_version" value={analysis.analysis_version} />
      </div>
    </div>
  );
}


function guidanceLevelStyles(level: OperatorGuidanceLevel) {
  if (level === "critical") return "border-red-200 bg-red-50 text-red-800";
  if (level === "warning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function OperatorGuidancePanel({ analysis, isFallback }: { analysis: IntakeAnalysisResult | null; isFallback: boolean }) {
  const guidance = buildOperatorGuidance(analysis, isFallback);

  if (!guidance) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Operator Guidance</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          暂无可用 AI analysis，当前不提供建议动作层。请先确认 analysis 可用后再人工判断下一步。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{guidance.title}</h2>
      <p className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">{guidance.disclaimer}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{guidance.highlight}</p>

      <div className="mt-3 space-y-2">
        {guidance.items.map((item) => (
          <div key={item.id} className={`rounded-lg border px-3 py-2 text-sm ${guidanceLevelStyles(item.level)}`}>
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1 leading-6">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await readInternalLeadByIdFromGoogleSheet(id).catch(() => undefined);

  if (!lead) {
    notFound();
  }

  let analysis: IntakeAnalysisResult | null = null;
  let analysisFallback = false;

  try {
    analysis = await buildIntakeAnalysis(lead);
  } catch {
    analysisFallback = true;
  }

  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Lead ID: {lead.id}</p>
              <h1 className="text-2xl font-semibold">{lead.customer_name || "Unnamed Lead"}</h1>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {statusLabels[lead.status as keyof typeof statusLabels] || lead.status}
            </span>
          </div>
          <Link href="/internal/leads" className="mt-3 inline-block text-sm text-slate-600 hover:underline">
            ← Back to leads
          </Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Lead Fields (v2 schema)</h2>
              <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <Field label="id" value={lead.id} />
                <Field label="created_at" value={lead.created_at} />
                <Field label="status" value={lead.status} />
                <Field label="customer_name" value={lead.customer_name} />
                <Field label="phone" value={lead.phone} />
                <Field label="city" value={lead.city} />
                <Field label="service_type" value={lead.service_type} />
                <Field label="urgency" value={lead.urgency} />
                <Field label="property_type" value={lead.property_type} />
                <Field label="source" value={lead.source} />
                <Field label="quote_amount" value={lead.quote_amount} />
                <Field label="problem_duration" value={lead.problem_duration} />
                <Field label="last_updated_at" value={lead.last_updated_at} />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">customer_notes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.customer_notes || "No notes provided."}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">ai_summary</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.ai_summary || "No AI summary available."}</p>
            </div>

            <IntakeAnalysisSection analysis={analysis} isFallback={analysisFallback} />

            <OperatorGuidancePanel analysis={analysis} isFallback={analysisFallback} />
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <LeadStatusUpdater leadId={lead.id} initialStatus={lead.status} />
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <LeadNotesEditor leadId={lead.id} initialNotes={lead.internal_notes} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
