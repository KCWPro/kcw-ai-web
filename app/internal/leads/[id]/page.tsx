import Link from "next/link";
import { notFound } from "next/navigation";
import { statusLabels } from "@/lib/internalLeads";
import { readInternalLeadByIdFromGoogleSheet } from "@/lib/internalLeadsStore";
import LeadStatusUpdater from "./LeadStatusUpdater";
import LeadNotesEditor from "./LeadNotesEditor";
import { buildIntakeAnalysis } from "@/lib/aiIntakeAnalysis";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <p>
      <span className="font-medium text-slate-500">{label}:</span> {value || "-"}
    </p>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const lead = await readInternalLeadByIdFromGoogleSheet(id).catch(() => undefined);

  if (!lead) {
    notFound();
  }

  const analysis = await buildIntakeAnalysis(lead);

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

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">AI Intake Analysis (Phase 2 - Step 1)</h2>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
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
