"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LeadStatus, statusLabels } from "@/lib/internalLeads";

type InternalLeadRow = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  service_type: string;
  urgency: string;
  source: string;
  status: string;
  created_at?: string;
};

const statusOptions: Array<{ label: string; value: "all" | LeadStatus }> = [
  { label: "All Status", value: "all" },
  { label: "New", value: "new" },
  { label: "Urgent", value: "urgent" },
  { label: "Waiting Follow-up", value: "follow_up" },
  { label: "Quoted", value: "quoted" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
];

export default function InternalLeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [leads, setLeads] = useState<InternalLeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/internal/leads", { cache: "no-store" });
        const data = await res.json();
        setLeads(data.leads || []);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase();
      const matchSearch =
        lead.customer_name.toLowerCase().includes(q) ||
        lead.phone.includes(search) ||
        lead.city.toLowerCase().includes(q) ||
        lead.service_type.toLowerCase().includes(q);

      const matchStatus = status === "all" || lead.status === status;
      return matchSearch && matchStatus;
    });
  }, [leads, search, status]);

  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold">Leads Queue</h1>
          <p className="mt-1 text-sm text-slate-500">Live leads from intake → internal operations workflow.</p>
        </header>

        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, phone, city, service..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | LeadStatus)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">customer_name</th>
                  <th className="px-4 py-3">phone</th>
                  <th className="px-4 py-3">city</th>
                  <th className="px-4 py-3">service_type</th>
                  <th className="px-4 py-3">urgency</th>
                  <th className="px-4 py-3">source</th>
                  <th className="px-4 py-3">status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/internal/leads/${lead.id}`} className="hover:underline">
                        {lead.customer_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{lead.phone}</td>
                    <td className="px-4 py-3">{lead.city}</td>
                    <td className="px-4 py-3">{lead.service_type}</td>
                    <td className="px-4 py-3 capitalize">{lead.urgency}</td>
                    <td className="px-4 py-3">{lead.source}</td>
                    <td className="px-4 py-3">{statusLabels[lead.status as LeadStatus] || lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredLeads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No matching leads found.</p>
          ) : null}
          {loading ? <p className="px-4 py-8 text-center text-sm text-slate-500">Loading leads...</p> : null}
        </section>
      </div>
    </main>
  );
}
