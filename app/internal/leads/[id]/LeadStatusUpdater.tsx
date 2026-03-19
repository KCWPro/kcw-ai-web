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
  const [message, setMessage] = useState<string>("");

  async function handleUpdate() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/internal/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to update status");
      }

      setStatus(data.lead.status);
      setMessage("Status saved.");
    } catch (error: unknown) {
      const messageText = error instanceof Error ? error.message : "Failed to update status";
      setMessage(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Lead Status</h2>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring"
          disabled={saving}
        >
          {statusOrder.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
