import type { ControlledSubmissionContract } from "../../../../lib/controlledSubmissionContract";
import type { InternalWorkflowDecisionSurfaceViewModel } from "../../../../lib/internalWorkflowDecisionSurface";

function decisionStatusStyles(status: InternalWorkflowDecisionSurfaceViewModel["decision_status"]) {
  if (status === "blocked") return "border-red-200 bg-red-50 text-red-800";
  if (status === "needs_review") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function decisionItemStatusStyles(status: "ready" | "needs_review" | "blocked" | "not_available") {
  if (status === "blocked") return "border-red-200 bg-red-50 text-red-800";
  if (status === "needs_review") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "not_available") return "border-slate-300 bg-slate-100 text-slate-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function controlledSubmissionStatusStyles(status: ControlledSubmissionContract["status"]) {
  if (status === "blocked") return "border-red-200 bg-red-50 text-red-800";
  if (status === "not_eligible") return "border-slate-300 bg-slate-100 text-slate-700";
  if (status === "needs_manual_confirmation") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function DecisionItemList({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: InternalWorkflowDecisionSurfaceViewModel["suggestion_only_items"];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-600">{subtitle}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-slate-900">{item.label}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${decisionItemStatusStyles(item.status)}`}>
                {item.status}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5">{item.detail}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">source: {item.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlledSubmissionReadinessSection({ contract }: { contract: ControlledSubmissionContract }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Controlled Submission Readiness (Read-only)</h3>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${controlledSubmissionStatusStyles(contract.status)}`}>
          {contract.status}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-700">Readiness interpretation only. No submit action is available in this step.</p>

      <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        <p>Manual confirmation is still required.</p>
        <p>No automatic execution is enabled.</p>
        <p>No submission has been performed.</p>
        <p>Readiness does not equal execution.</p>
        <p>Human-confirmed path is not submitted. Submission-ready is not submitted.</p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Selected path</p>
          <p className="mt-1">{contract.selected_path_id || "none"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Manual confirmation required</p>
          <p className="mt-1">{contract.manual_confirmation_required ? "yes" : "no"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Gate state</p>
          <p className="mt-1">{contract.gate_state}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Automation boundary</p>
          <p className="mt-1">
            auto_execution_enabled={String(contract.automation_boundary.auto_execution_enabled)} · submitted=
            {String(contract.automation_boundary.submitted)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:col-span-1">
          <p className="font-semibold text-slate-900">Readiness explanation</p>
          {contract.reasons.length === 0 ? (
            <p className="mt-1 text-slate-500">No reasons.</p>
          ) : (
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {contract.reasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:col-span-1">
          <p className="font-semibold text-slate-900">Missing requirements</p>
          {contract.missing_requirements.length === 0 ? (
            <p className="mt-1 text-slate-500">No missing requirements.</p>
          ) : (
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {contract.missing_requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:col-span-1">
          <p className="font-semibold text-slate-900">Blockers</p>
          {contract.blockers.length === 0 ? (
            <p className="mt-1 text-slate-500">No blockers.</p>
          ) : (
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {contract.blockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 font-semibold text-slate-900">Gate reasons</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {contract.gate_reasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DecisionSurfaceSection({
  decisionSurface,
  controlledSubmissionContract,
}: {
  decisionSurface: InternalWorkflowDecisionSurfaceViewModel;
  controlledSubmissionContract?: ControlledSubmissionContract;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Internal Workflow Decision Surface</h2>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${decisionStatusStyles(decisionSurface.decision_status)}`}>
          {decisionSurface.decision_status}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-700">{decisionSurface.decision_summary}</p>
      <p className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
        Read-only guidance. Next manual review action: {decisionSurface.next_manual_review_action}
      </p>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <p>
          Layer contract: <strong>Suggestion-only</strong> · <strong>Human-confirmed path</strong> ·
          <strong> Not-yet-implemented automation</strong>
        </p>
        <p className="mt-1">
          Does not auto-advance workflow. Does not contact customer automatically. Does not create tasks automatically. Does not
          write business records automatically.
        </p>
      </div>

      {controlledSubmissionContract ? <ControlledSubmissionReadinessSection contract={controlledSubmissionContract} /> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Priority</p>
          <p className="mt-1">{decisionSurface.priority}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:col-span-2">
          <p className="font-semibold text-slate-900">Source alignment notes</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {decisionSurface.source_alignment_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <DecisionItemList
          title="Suggestion-only items"
          subtitle="Read-only recommendations and context, not executed actions."
          items={decisionSurface.suggestion_only_items}
        />
        <DecisionItemList
          title="Human-confirmed paths"
          subtitle="Manual handling paths that still require operator confirmation."
          items={decisionSurface.human_confirmed_paths}
        />
        <DecisionItemList
          title="Not-yet-implemented automation"
          subtitle="Explicit boundaries. The system will not run these actions automatically."
          items={decisionSurface.automation_boundary_notices}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Review notes</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {decisionSurface.review_notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Risk flags</p>
          {decisionSurface.risk_flags.length === 0 ? (
            <p className="mt-1 text-slate-500">No risk flags.</p>
          ) : (
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {decisionSurface.risk_flags.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
