import Link from "next/link";
import { buildIntakeAnalysis, type IntakeAnalysisResult } from "@/lib/aiIntakeAnalysis";
import { buildInternalActionHandoff } from "@/lib/internalActionHandoff";
import { buildInternalEstimateDraft } from "@/lib/internalEstimateDraft";
import { buildInternalFollowUpWorkflowSuggestion } from "@/lib/internalFollowUpWorkflowSuggestion";
import { statusLabels, type LeadStatus } from "@/lib/internalLeads";
import { readInternalLeadsFromGoogleSheet, type StoredLead } from "@/lib/internalLeadsStore";
import { buildOperatorGuidance } from "@/lib/internalOperatorGuidance";
import { buildInternalWorkflowContinuity } from "@/lib/internalWorkflowContinuity";
import { buildInternalWorkflowDecisionSurface } from "@/lib/internalWorkflowDecisionSurface";

const cardBase =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md";

function toDateKey(value: string) {
  const normalized = value.trim().replace(" ", "T");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function createdAtTime(value: string) {
  const normalized = value.trim().replace(" ", "T");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime();
  }

  return 0;
}

function getStatusLabel(status: string) {
  const label = statusLabels[status as LeadStatus];
  return label || status || "Unknown";
}

type LeadRuntimeSnapshot = {
  lead: StoredLead;
  continuityState: "ready_for_follow_up" | "needs_intake_completion" | "blocked";
  decisionStatus: "ready_for_manual_progress" | "needs_review" | "blocked";
  followUpAvailability: "available" | "unavailable";
  estimateAvailability: "available" | "unavailable";
  nextReviewSuggestion: string;
};

async function buildLeadRuntimeSnapshot(lead: StoredLead): Promise<LeadRuntimeSnapshot> {
  let analysis: IntakeAnalysisResult | null = null;

  try {
    analysis = await buildIntakeAnalysis({
      service_type: lead.service_type,
      urgency: lead.urgency,
      customer_notes: lead.customer_notes,
      problem_duration: lead.problem_duration,
      property_type: lead.property_type,
      phone: lead.phone,
      city: lead.city,
    });
  } catch {
    analysis = null;
  }

  const guidance = buildOperatorGuidance(analysis, !analysis);
  const handoff = buildInternalActionHandoff({
    lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
    analysis,
    guidance,
  });

  const estimateDraft = buildInternalEstimateDraft({
    lead: {
      id: lead.id,
      city: lead.city,
      urgency: lead.urgency,
      property_type: lead.property_type,
      service_type: lead.service_type,
    },
    analysis,
    guidance,
    handoff,
  });

  const followUpSuggestion = buildInternalFollowUpWorkflowSuggestion({
    lead: {
      id: lead.id,
      urgency: lead.urgency,
      city: lead.city,
      service_type: lead.service_type,
    },
    analysis,
    guidance,
    handoff,
    estimateDraft,
  });

  const continuity = buildInternalWorkflowContinuity({
    lead: { id: lead.id, status: lead.status },
    analysis,
    guidance,
    handoff,
    estimateDraft,
    followUpSuggestion,
  });

  const decisionSurface = buildInternalWorkflowDecisionSurface({
    analysis,
    guidance,
    handoff,
    estimateDraft,
    followUpSuggestion,
    continuity,
  });

  return {
    lead,
    continuityState: continuity.continuity_state,
    decisionStatus: decisionSurface.decision_status,
    followUpAvailability: followUpSuggestion.availability,
    estimateAvailability: estimateDraft.availability,
    nextReviewSuggestion: decisionSurface.next_manual_review_action,
  };
}

export default async function InternalDashboardPage() {
  let sourceWarning = "";
  let leads: StoredLead[] = [];

  try {
    leads = await readInternalLeadsFromGoogleSheet();
  } catch (error: unknown) {
    sourceWarning = error instanceof Error ? error.message : "Failed to read live leads for dashboard preview.";
  }

  const sortedLeads = [...leads].sort((a, b) => createdAtTime(b.created_at) - createdAtTime(a.created_at));
  const leadSnapshots = await Promise.all(sortedLeads.map((lead) => buildLeadRuntimeSnapshot(lead)));
  const todayKey = new Date().toISOString().slice(0, 10);

  const leadsToday = sortedLeads.filter((lead) => toDateKey(lead.created_at) === todayKey);
  const latestLead = sortedLeads[0];
  const urgentLeads = sortedLeads.filter((lead) => lead.urgency === "high");

  const needsReviewLeads = leadSnapshots
    .filter(
      (snapshot) =>
        snapshot.decisionStatus === "blocked" ||
        snapshot.decisionStatus === "needs_review" ||
        snapshot.continuityState === "needs_intake_completion",
    )
    .sort((a, b) => {
      const priorityA = a.decisionStatus === "blocked" ? 2 : a.decisionStatus === "needs_review" ? 1 : 0;
      const priorityB = b.decisionStatus === "blocked" ? 2 : b.decisionStatus === "needs_review" ? 1 : 0;
      if (priorityA !== priorityB) return priorityB - priorityA;
      return createdAtTime(b.lead.created_at) - createdAtTime(a.lead.created_at);
    });

  const blockedCount = leadSnapshots.filter((snapshot) => snapshot.decisionStatus === "blocked").length;
  const needsIntakeCompletionCount = leadSnapshots.filter(
    (snapshot) => snapshot.continuityState === "needs_intake_completion",
  ).length;
  const needsReviewCount = leadSnapshots.filter((snapshot) => snapshot.decisionStatus === "needs_review").length;

  const followUpAvailableCount = leadSnapshots.filter((snapshot) => snapshot.followUpAvailability === "available").length;
  const estimateAvailableCount = leadSnapshots.filter((snapshot) => snapshot.estimateAvailability === "available").length;

  const stats = [
    {
      label: "New Today",
      value: leadsToday.length,
    },
    {
      label: "Urgent Leads",
      value: urgentLeads.length,
    },
    {
      label: "Needs Review",
      value: needsReviewLeads.length,
    },
    {
      label: "Follow-up Suggestions",
      value: `${followUpAvailableCount}/${leadSnapshots.length}`,
    },
  ];

  return (
    <main className="px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Internal Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">KCW Internal Preview Workspace</h1>
          <p className="mt-2 text-sm text-slate-300">
            Read-only and suggestion-first preview for internal lead review and coordination.
          </p>
        </header>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
          <p className="font-semibold uppercase tracking-wide">Beta Boundary</p>
          <p className="mt-1">
            This internal area is a controlled Beta preview for review/suggestion workflows only. It does not
            represent automated execution, workflow advancement, or external write authority.
          </p>
        </section>

        {sourceWarning ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm">
            <p className="font-semibold uppercase tracking-wide">Live Source Warning</p>
            <p className="mt-1">
              Dashboard preview could not load live leads from the shared internal read path. Review remains read-only.
            </p>
            <p className="mt-1 text-xs">{sourceWarning}</p>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className={cardBase}>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className={cardBase}>
            <h2 className="text-lg font-semibold">New Leads Today Summary</h2>
            <p className="mt-2 text-sm text-slate-600">
              {leadsToday.length} leads entered today ({todayKey}). Preview is read-only and for operator-reviewed triage.
            </p>
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Latest added lead: {latestLead ? `${latestLead.customer_name} · ${latestLead.city} · ${latestLead.service_type} · ${getStatusLabel(latestLead.status)}` : "No live leads currently available."}
            </p>
          </div>

          <div className={cardBase}>
            <h2 className="text-lg font-semibold">Urgent / High-priority Summary</h2>
            <p className="mt-2 text-sm text-slate-600">
              {urgentLeads.length} urgent leads currently visible for review. This is a suggestion-only prioritization signal.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {urgentLeads.slice(0, 3).map((lead) => (
                <li key={lead.id} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <p className="font-medium text-red-900">{lead.customer_name}</p>
                  <p className="text-xs text-red-800">
                    {lead.city} · {lead.service_type} · {getStatusLabel(lead.status)}
                  </p>
                </li>
              ))}
              {urgentLeads.length === 0 ? <li className="text-xs text-slate-500">No urgent leads in current live list.</li> : null}
            </ul>
          </div>

          <div className={cardBase}>
            <h2 className="text-lg font-semibold">Needs Review Summary</h2>
            <p className="mt-2 text-sm text-slate-600">
              Decision-surface preview: {needsReviewCount} needs_review · {needsIntakeCompletionCount} needs_intake_completion · {blockedCount} blocked.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {needsReviewLeads.slice(0, 3).map((snapshot) => (
                <li key={snapshot.lead.id} className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                  <p className="font-medium text-amber-900">{snapshot.lead.customer_name}</p>
                  <p className="text-xs text-amber-800">
                    {snapshot.decisionStatus} · {snapshot.continuityState}
                  </p>
                </li>
              ))}
              {needsReviewLeads.length === 0 ? <li className="text-xs text-slate-500">No review-priority leads in current live list.</li> : null}
            </ul>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className={cardBase}>
            <h2 className="text-lg font-semibold">Follow-up Suggestion Availability</h2>
            <p className="mt-2 text-sm text-slate-600">
              Suggestion available: {followUpAvailableCount} · unavailable: {leadSnapshots.length - followUpAvailableCount}.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Preview-only. Follow-up ideas remain operator-reviewed and do not contact customers automatically.
            </p>
          </div>

          <div className={cardBase}>
            <h2 className="text-lg font-semibold">Estimate Draft Availability</h2>
            <p className="mt-2 text-sm text-slate-600">
              Estimate draft suggestion available: {estimateAvailableCount} · unavailable: {leadSnapshots.length - estimateAvailableCount}.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Draft availability only. This does not indicate any formal quote has been generated or sent.
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className={`${cardBase} p-0`}>
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold">Recent Leads Next-step Preview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Suggestion-only next step preview for operator review. No automatic execution or status advancement.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {leadSnapshots.slice(0, 5).map((snapshot) => (
                  <Link
                    key={snapshot.lead.id}
                    href={`/internal/leads/${snapshot.lead.id}`}
                    className="flex flex-col gap-1 px-5 py-4 hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-slate-800">{snapshot.lead.customer_name}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {getStatusLabel(snapshot.lead.status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {snapshot.lead.city} · {snapshot.lead.service_type}
                    </p>
                    <p className="text-xs text-slate-600">
                      Next step suggestion (operator-reviewed): {snapshot.nextReviewSuggestion}
                    </p>
                  </Link>
                ))}
                {leadSnapshots.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-slate-500">No live leads available for recent preview.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className={cardBase}>
              <h2 className="text-lg font-semibold">Suggestion Review Center</h2>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li>• Review new and follow-up leads for operator decision support.</li>
                <li>• Quote draft suggestions are preview-only until manually approved outside this page.</li>
                <li>• Follow-up suggestions are informational and do not auto-send.</li>
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
                  Preview Daily Follow-up Suggestions
                </button>
                <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  Preview Quote Reminder Drafts
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
