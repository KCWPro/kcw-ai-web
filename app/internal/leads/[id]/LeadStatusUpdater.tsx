"use client";

import { useState } from "react";
import { LeadStatus, statusLabels } from "@/lib/internalLeads";

const statusOrder: LeadStatus[] = ["new", "follow_up", "quoted", "scheduled", "completed", "archived"];

type LeadStatusUpdaterProps = {
  initialStatus: string;
};

export default function LeadStatusUpdater({ initialStatus }: LeadStatusUpdaterProps) {
  const [status, setStatus] = useState<string>(initialStatus || "new");

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Lead Status (Preview Only)</h2>
      <p className="text-xs text-amber-700">
        Beta boundary: status updates are disabled here. This page is read-only and does not write to Google
        Sheets.
      </p>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
        >
          {statusOrder.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled
          className="rounded-lg bg-slate-400 px-3 py-2 text-sm font-medium text-white opacity-70"
          title="Disabled in Beta preview"
        >
          Save disabled
        </button>
      </div>
    </div>
  );
}
