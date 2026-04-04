"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { directorLeadStatusLabels, directorLeadStatuses, type DirectorLeadStatus } from "@/lib/directorConsole/status";
import { toDirectorLeads } from "@/lib/directorConsole/mockData";
import type { LeadMasterRecord } from "@/lib/directorConsole/types";

export default function InternalLeadsPage() {
  const [leads, setLeads] = useState<LeadMasterRecord[]>([]);
  const [status, setStatus] = useState<"all" | DirectorLeadStatus>("all");
  const [city, setCity] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [risk, setRisk] = useState("all");

  useEffect(() => {
    fetch("/api/internal/leads", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setLeads(toDirectorLeads(data.leads || [])));
  }, []);

  const cities = useMemo(() => Array.from(new Set(leads.map((l) => l.city))), [leads]);
  const jobs = useMemo(() => Array.from(new Set(leads.map((l) => l.engineering_decision.job_type))), [leads]);

  const filtered = leads.filter((lead) => {
    return (status === "all" || lead.status === status)
      && (city === "all" || lead.city === city)
      && (jobType === "all" || lead.engineering_decision.job_type === jobType)
      && (risk === "all" || lead.risk_level === risk);
  });

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Lead Inbox</h1>
      <section className="grid gap-2 rounded-2xl bg-white p-3 shadow-sm md:grid-cols-4">
        <select className="rounded border p-2" value={status} onChange={(e) => setStatus(e.target.value as "all" | DirectorLeadStatus)}>
          <option value="all">All status</option>
          {directorLeadStatuses.map((s) => <option key={s} value={s}>{directorLeadStatusLabels[s]}</option>)}
        </select>
        <select className="rounded border p-2" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All city</option>
          {cities.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="rounded border p-2" value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="all">All engineering type</option>
          {jobs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="rounded border p-2" value={risk} onChange={(e) => setRisk(e.target.value)}>
          <option value="all">All risk</option>
          <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option>
        </select>
      </section>

      <section className="space-y-2">
        {filtered.map((lead) => (
          <Link href={`/internal/leads/${lead.id}`} key={lead.id} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400">
            <div className="grid gap-2 text-sm md:grid-cols-4">
              <p><b>{lead.customer_name}</b> · {lead.phone}</p>
              <p>{lead.address} / {lead.city}</p>
              <p>{lead.issue_summary}</p>
              <p>media {lead.media_assets.length} · {directorLeadStatusLabels[lead.status]}</p>
              <p>AI: {lead.ai_initial_classification}</p>
              <p>risk: {lead.risk_level}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
