"use client";

import { useState } from "react";
import type { IntakeAnalysisResult } from "@/lib/aiIntakeAnalysis";

function AnalysisField({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-6 text-slate-700">
      <span className="font-medium text-slate-500">{label}:</span> {value}
    </p>
  );
}

function formatUsd(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type IntakeAnalysisPanelProps = {
  leadId: string;
  initialAnalysis: IntakeAnalysisResult | null;
  isFallback: boolean;
};

export default function IntakeAnalysisPanel({ leadId, initialAnalysis, isFallback }: IntakeAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<IntakeAnalysisResult | null>(initialAnalysis);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleReanalyze() {
    setRunning(true);
    setNotice("");

    try {
      const response = await fetch(`/api/internal/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "manual_reanalyze",
          payload: {},
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error || "Failed to run analysis");
      }

      setAnalysis(data.analysis || null);
      setNotice("Re-analysis completed. Manual internal action only (no automatic downstream trigger).");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to run analysis";
      setNotice(`Re-analyze failed: ${message}`);
    } finally {
      setRunning(false);
    }
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-amber-900">AI Intake Analysis</h2>
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={running}
            className="rounded-lg bg-amber-800 px-3 py-2 text-xs font-medium text-white disabled:opacity-70"
          >
            {running ? "Re-analyzing..." : "Re-analyze"}
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-amber-800">
          AI analysis is temporarily unavailable. Lead detail data remains available. Use manual Re-analyze to retry.
        </p>
        <p className="mt-2 text-xs text-amber-800">
          Controlled internal Beta: manual-only for this lead, with no automatic workflow or follow-up trigger.
        </p>
        {notice ? <p className="mt-2 text-xs text-amber-900">{notice}</p> : null}
      </div>
    );
  }

  const missingFields = analysis.missing_fields.length > 0 ? analysis.missing_fields.join(", ") : "None";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">AI Intake Analysis</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Manual re-analyze</span>
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={running}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-70"
            title="Manual re-analyze for this lead only"
          >
            {running ? "Re-analyzing..." : "Re-analyze"}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Controlled internal Beta: manual-only action for this lead. No auto-run, no downstream trigger, no workflow
        auto-advancement.
      </p>

      {isFallback ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Analysis is served with safe degradation mode due to runtime issue.
        </p>
      ) : null}

      {notice ? <p className="mt-3 text-xs text-slate-600">{notice}</p> : null}

      <div className="mt-3 space-y-1">
        <AnalysisField label="issue_classification" value={analysis.issue_classification} />
        <AnalysisField label="info_completeness" value={analysis.info_completeness} />
        <AnalysisField label="missing_fields" value={missingFields} />
        <AnalysisField label="recommended_action" value={analysis.recommended_action} />
        <AnalysisField
          label="suggested_price_range"
          value={`${analysis.suggested_price_range.band} (${formatUsd(analysis.suggested_price_range.min)} - ${formatUsd(analysis.suggested_price_range.max)})`}
        />
        <AnalysisField label="price_notes" value={analysis.suggested_price_range.notes} />
        <AnalysisField label="next_step" value={analysis.next_step} />
        <AnalysisField label="confidence" value={analysis.confidence.toFixed(2)} />
        <AnalysisField label="analysis_version" value={analysis.analysis_version} />
      </div>
    </div>
  );
}
