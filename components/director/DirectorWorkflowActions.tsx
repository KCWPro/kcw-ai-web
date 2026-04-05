"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIRECTOR_STATUSES, type DirectorCaseStatus } from "@/lib/director/types";

const actionMap: Array<{ label: string; target: DirectorCaseStatus }> = [
  { label: "Mark Draft", target: "draft" },
  { label: "Mark Needs Review", target: "engineering_review_ready" },
  { label: "Mark Estimate Ready", target: "estimate_ready" },
  { label: "Mark Contract Ready", target: "contract_ready" },
  { label: "Mark Permit Review Pending", target: "permit_review_pending" },
  { label: "Mark Procurement Review Pending", target: "procurement_review_pending" },
  { label: "Mark Site Visit Needed", target: "site_visit_needed" },
  { label: "Mark Completed", target: "completed" },
  { label: "Archive", target: "archived" },
];

export default function DirectorWorkflowActions({ caseId }: { caseId: string }) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function updateStatus(target: DirectorCaseStatus) {
    if (!(DIRECTOR_STATUSES as readonly string[]).includes(target)) {
      return;
    }
    setSaving(target);
    setError("");
    const res = await fetch(`/api/director/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_status: target }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      setError(payload.error || "Failed to update status");
      setSaving(null);
      return;
    }
    setSaving(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {actionMap.map((action) => (
          <button
            key={action.target}
            type="button"
            disabled={Boolean(saving)}
            onClick={() => updateStatus(action.target)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {saving === action.target ? "Updating..." : action.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
