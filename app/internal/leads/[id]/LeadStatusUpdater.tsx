"use client";

import { useState } from "react";
import { LeadStatus, statusLabels } from "@/lib/internalLeads";

const statusOrder: LeadStatus[] = ["new", "follow_up", "quoted", "scheduled", "completed", "archived"];

type LeadStatusUpdaterProps = {
  leadId: string;
  initialStatus: string;
};

export default function LeadStatusUpdater({ leadId, initialStatus }: LeadStatusUpdaterProps) {
  const [status, setStatus] = useState<string>(initialStatus || "new");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSave() {
    setSaving(true);
    setNotice("");

    try {
      const response = await fetch(`/api/internal/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "status_update",
          payload: { status },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error || "Failed to save status");
      }

      setStatus(data?.lead?.status || status);
      setNotice("Status saved. Manual internal action only (no automatic workflow advancement).");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save status";
      setNotice(`Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Lead Status</h2>
      <p className="text-xs text-amber-700">
        Controlled internal Beta: manual operator save only for this lead. This does not auto-advance workflow or
        trigger other modules.
      </p>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none disabled:opacity-60"
        >
          {statusOrder.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-70"
          title="Manual status save (single lead only)"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {notice ? <p className="text-xs text-slate-600">{notice}</p> : null}
    </div>
  );
}
