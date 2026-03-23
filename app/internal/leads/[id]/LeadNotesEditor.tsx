"use client";

import { useState } from "react";

type LeadNotesEditorProps = {
  initialNotes: string;
};

export default function LeadNotesEditor({ initialNotes }: LeadNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Internal Notes (Preview Only)</h2>
      <p className="text-xs text-amber-700">
        Beta boundary: note editing is disabled here. This page is read-only and does not write to Google Sheets.
      </p>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={8}
        className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none"
        placeholder="Internal follow-up details..."
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="rounded-lg bg-slate-400 px-3 py-2 text-sm font-medium text-white opacity-70"
          title="Disabled in Beta preview"
        >
          Save notes disabled
        </button>
      </div>
    </div>
  );
}
