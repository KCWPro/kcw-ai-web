import Link from "next/link";
import { internalLeads, statusLabels } from "@/lib/internalLeads";

const cardBase =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md";

const stats = [
  {
    label: "New Today",
    value: internalLeads.filter((lead) => lead.status === "new").length,
  },
  {
    label: "Urgent",
    value: internalLeads.filter((lead) => lead.status === "urgent").length,
  },
  {
    label: "Waiting Follow-up",
    value: internalLeads.filter((lead) => lead.status === "follow_up").length,
  },
  {
    label: "Quotes in Progress",
    value: internalLeads.filter((lead) => lead.status === "quoted").length,
  },
];

export default function InternalDashboardPage() {
  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Internal Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">KCW AI Operations</h1>
          <p className="mt-2 text-sm text-slate-300">
            Daily lead operations overview for dispatch, quoting, and follow-up.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className={cardBase}>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className={`${cardBase} p-0`}>
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold">Recent Leads</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {internalLeads.slice(0, 5).map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/internal/leads/${lead.id}`}
                    className="flex flex-col gap-1 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{lead.customer_name}</p>
                      <p className="text-sm text-slate-500">
                        {lead.city} · {lead.service_type}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      {statusLabels[lead.status]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className={cardBase}>
              <h2 className="text-lg font-semibold">AI Action Center</h2>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li>• 2 urgent leads need immediate call routing.</li>
                <li>• 1 quote draft can be sent after price review.</li>
                <li>• 1 follow-up is due within the next hour.</li>
              </ul>
            </div>

            <div className={cardBase}>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/internal/leads"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Open Leads Queue
                </Link>
                <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Generate Daily Follow-up List
                </button>
                <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Draft Quote Reminder Messages
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
