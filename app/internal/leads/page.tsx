"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
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
  { label: "Waiting Follow-up", value: "follow_up" },
  { label: "Quoted", value: "quoted" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

type QueueFilter = "all" | "new_today" | "urgent" | "needs_review" | "follow_up_available" | "estimate_available";

const queueFilterLabels: Record<QueueFilter, string> = {
  all: "All leads",
  new_today: "New today",
  urgent: "Urgent leads",
  needs_review: "Needs review queue",
  follow_up_available: "Follow-up suggestion queue",
  estimate_available: "Estimate draft queue",
};

type DrillDownMode = "all" | "created_today" | "urgent" | "needs_review" | "follow_up_available" | "estimate_available";

function InternalLeadsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [leads, setLeads] = useState<InternalLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [drillDownMode, setDrillDownMode] = useState<DrillDownMode>("all");
  const [drillDownIds, setDrillDownIds] = useState<Set<string> | null>(null);
  const [hasDrillDownIdsParam, setHasDrillDownIdsParam] = useState(false);
  const [followUpScope, setFollowUpScope] = useState<"available" | null>(null);
  const [estimateScope, setEstimateScope] = useState<"available" | null>(null);

  async function loadLeads() {
    try {
      const res = await fetch("/api/internal/leads", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to load leads");
      }

      setLeads(data.leads || []);
      setError("");
    } catch (loadError: unknown) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load leads";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();

    const intervalId = setInterval(() => {
      loadLeads();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const rawFilter = searchParams.get("filter");
    const rawCreated = searchParams.get("created");
    const rawUrgency = searchParams.get("urgency");
    const rawReview = searchParams.get("review");
    const rawFollowUpScope = searchParams.get("followup");
    const rawEstimateScope = searchParams.get("estimate");
    const rawIds = searchParams.get("ids");

    if (rawFollowUpScope === "available") {
      setFollowUpScope("available");
    } else {
      setFollowUpScope(null);
    }
    if (rawEstimateScope === "available") {
      setEstimateScope("available");
    } else {
      setEstimateScope(null);
    }

    const parsedIds = (rawIds || "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    setHasDrillDownIdsParam(rawIds !== null);
    setDrillDownIds(rawIds !== null ? new Set(parsedIds) : null);

    if (rawCreated === "today") {
      setDrillDownMode("created_today");
      setQueueFilter("new_today");
      return;
    }
    if (rawUrgency === "urgent") {
      setDrillDownMode("urgent");
      setQueueFilter("urgent");
      return;
    }
    if (rawReview === "1") {
      setDrillDownMode("needs_review");
      setQueueFilter("needs_review");
      return;
    }
    if (rawFollowUpScope === "available") {
      setDrillDownMode("follow_up_available");
      setQueueFilter("follow_up_available");
      return;
    }
    if (rawEstimateScope === "available") {
      setDrillDownMode("estimate_available");
      setQueueFilter("estimate_available");
      return;
    }

    if (
      rawFilter === "new_today" ||
      rawFilter === "urgent" ||
      rawFilter === "needs_review" ||
      rawFilter === "follow_up_available" ||
      rawFilter === "estimate_available"
    ) {
      setQueueFilter(rawFilter);
      setDrillDownMode(
        rawFilter === "new_today"
          ? "created_today"
          : rawFilter === "urgent"
            ? "urgent"
            : rawFilter === "needs_review"
              ? "needs_review"
              : rawFilter === "follow_up_available"
                ? "follow_up_available"
                : "estimate_available",
      );
      return;
    }
    setQueueFilter("all");
    setDrillDownMode("all");
  }, [searchParams]);

  const filteredLeads = useMemo(() => {
    const hasPinnedDrillDownIds = drillDownIds !== null;
    const matchesPinnedIds = (leadId: string) => !hasPinnedDrillDownIds || drillDownIds.has(leadId);
    const hasExplicitPinnedIds = hasDrillDownIdsParam;

    return leads.filter((lead) => {
      const q = search.toLowerCase();
      const matchSearch =
        lead.customer_name.toLowerCase().includes(q) ||
        lead.phone.includes(search) ||
        lead.city.toLowerCase().includes(q) ||
        lead.service_type.toLowerCase().includes(q);

      const matchStatus = status === "all" || lead.status === status;
      const createdAtKey = lead.created_at?.slice(0, 10);
      const matchDrillDownMode =
        drillDownMode === "all" ||
        (drillDownMode === "created_today" && createdAtKey === todayKey) ||
        (drillDownMode === "urgent" && lead.urgency === "high") ||
        (drillDownMode === "needs_review" &&
          (hasExplicitPinnedIds
            ? hasPinnedDrillDownIds && matchesPinnedIds(lead.id)
            : lead.status === "new" || lead.status === "follow_up")) ||
        (drillDownMode === "follow_up_available" &&
          (hasExplicitPinnedIds
            ? hasPinnedDrillDownIds && matchesPinnedIds(lead.id)
            : followUpScope === "available"
              ? false
              : lead.status === "follow_up")) ||
        (drillDownMode === "estimate_available" &&
          (hasExplicitPinnedIds
            ? hasPinnedDrillDownIds && matchesPinnedIds(lead.id)
            : estimateScope === "available"
              ? false
              : lead.status === "quoted"));
      const matchQueueFilter =
        queueFilter === "all" ||
        (queueFilter === "new_today" && createdAtKey === todayKey) ||
        (queueFilter === "urgent" && lead.urgency === "high") ||
        (queueFilter === "needs_review" &&
          (hasExplicitPinnedIds
            ? hasPinnedDrillDownIds && matchesPinnedIds(lead.id)
            : lead.status === "new" || lead.status === "follow_up")) ||
        (queueFilter === "follow_up_available" &&
          (hasExplicitPinnedIds
            ? hasPinnedDrillDownIds && matchesPinnedIds(lead.id)
            : followUpScope === "available"
              ? false
              : lead.status === "follow_up")) ||
        (queueFilter === "estimate_available" &&
          (hasExplicitPinnedIds
            ? hasPinnedDrillDownIds && matchesPinnedIds(lead.id)
            : estimateScope === "available"
              ? false
              : lead.status === "quoted"));
      const matchDrillDownIds = matchesPinnedIds(lead.id);

      return matchSearch && matchStatus && matchQueueFilter && matchDrillDownMode && matchDrillDownIds;
    });
  }, [drillDownIds, drillDownMode, estimateScope, followUpScope, hasDrillDownIdsParam, leads, queueFilter, search, status, todayKey]);

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
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={loadLeads}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p>
            Active dashboard filter: <span className="font-semibold text-slate-900">{queueFilterLabels[queueFilter]}</span>
          </p>
          {(followUpScope === "available" || estimateScope === "available" || drillDownMode === "needs_review") &&
          drillDownIds !== null ? (
            <p className="mt-1 text-xs text-slate-600">
              Dashboard drill-down is pinned to runtime snapshot IDs ({drillDownIds.size}) to keep counts aligned.
            </p>
          ) : null}
          {queueFilter !== "all" ? (
            <Link
              href="/internal/leads"
              className="mt-2 inline-flex items-center font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-slate-700"
            >
              Clear dashboard filter
            </Link>
          ) : null}
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
          {error ? <p className="px-4 py-2 text-center text-sm text-red-600">{error}</p> : null}
          {!loading && filteredLeads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No matching leads found.</p>
          ) : null}
          {loading ? <p className="px-4 py-8 text-center text-sm text-slate-500">Loading leads...</p> : null}
        </section>
      </div>
    </main>
  );
}

export default function InternalLeadsPage() {
  return (
    <Suspense
      fallback={
        <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <section className="rounded-2xl bg-white px-6 py-5 shadow-sm">
              <h1 className="text-2xl font-semibold">Leads Queue</h1>
              <p className="mt-1 text-sm text-slate-500">Loading dashboard drill-down…</p>
            </section>
          </div>
        </main>
      }
    >
      <InternalLeadsPageContent />
    </Suspense>
  );
}
