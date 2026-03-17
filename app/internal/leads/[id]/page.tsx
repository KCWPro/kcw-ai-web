import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById, statusLabels } from "@/lib/internalLeads";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Lead ID: {lead.id}</p>
              <h1 className="text-2xl font-semibold">{lead.customer_name}</h1>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {statusLabels[lead.status]}
            </span>
          </div>
          <Link href="/internal/leads" className="mt-3 inline-block text-sm text-slate-600 hover:underline">
            ← Back to leads
          </Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Customer Information</h2>
              <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-500">Phone:</span> {lead.phone}
                </p>
                <p>
                  <span className="font-medium text-slate-500">City:</span> {lead.city}
                </p>
                <p>
                  <span className="font-medium text-slate-500">Service Type:</span> {lead.service_type}
                </p>
                <p>
                  <span className="font-medium text-slate-500">Urgency:</span> {lead.urgency}
                </p>
                <p>
                  <span className="font-medium text-slate-500">Source:</span> {lead.source}
                </p>
                <p>
                  <span className="font-medium text-slate-500">Preferred Visit:</span> {lead.preferred_visit_window}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Original Intake</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.intake_raw}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">AI Summary</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.ai_summary}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Suggested Next Step</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.suggested_next_step}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Internal Notes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{lead.internal_notes}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Quick Reply Actions</h2>
              <div className="mt-3 flex flex-col gap-2">
                <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                  Send SMS Acknowledgement
                </button>
                <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                  Request Additional Photos
                </button>
                <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                  Mark as Follow-up Needed
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
