import { quoteDraftMock } from "@/lib/internalOpsMocks";

export default function InternalQuotesPage() {
  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold">AI Quote Draft Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Prototype workspace for reviewing AI-generated draft quotes.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-lg font-semibold">Lead Info</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-500">Lead ID:</span> {quoteDraftMock.lead_id}
              </p>
              <p>
                <span className="font-medium text-slate-500">Customer:</span> {quoteDraftMock.customer_name}
              </p>
              <p>
                <span className="font-medium text-slate-500">City:</span> {quoteDraftMock.city}
              </p>
              <p>
                <span className="font-medium text-slate-500">Service:</span> {quoteDraftMock.service_type}
              </p>
              <p>
                <span className="font-medium text-slate-500">Urgency:</span> {quoteDraftMock.urgency}
              </p>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Scope Summary</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{quoteDraftMock.scope_summary}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Suggested Pricing Range</h2>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{quoteDraftMock.suggested_pricing_range}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Customer-facing Draft Text</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{quoteDraftMock.customer_facing_draft_text}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Internal Notes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{quoteDraftMock.internal_notes}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
