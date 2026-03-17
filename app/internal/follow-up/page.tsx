import { followUpMock } from "@/lib/internalOpsMocks";

export default function InternalFollowUpPage() {
  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold">Follow-up Assistant</h1>
          <p className="mt-1 text-sm text-slate-500">Prototype for multilingual follow-up messaging and timing guidance.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Lead Context</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-500">Lead ID:</span> {followUpMock.lead_id}
              </p>
              <p>
                <span className="font-medium text-slate-500">Customer:</span> {followUpMock.customer_name}
              </p>
              <p>
                <span className="font-medium text-slate-500">Service:</span> {followUpMock.service_type}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Follow-up Timing Suggestion</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{followUpMock.follow_up_timing_suggestion}</p>
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{followUpMock.urgency_note}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">English SMS Draft</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{followUpMock.sms_draft_en}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">中文微信草稿</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{followUpMock.wechat_draft_zh}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
