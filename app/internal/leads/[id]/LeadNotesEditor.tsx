"use client";

import { useState } from "react";

type LeadNotesEditorProps = {
  leadId: string;
  initialNotes: string;
};

export default function LeadNotesEditor({ leadId, initialNotes }: LeadNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
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
          intent: "notes_update",
          payload: { internal_notes: notes },
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || "Failed to save notes");
      }

      setNotes(data?.lead?.internal_notes ?? notes);
      setNotice("Internal notes saved. Manual internal action only (no automatic follow-up or workflow trigger).");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save notes";
      setNotice(`Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Internal Notes</h2>
      <p className="text-xs text-amber-700">
        Controlled internal Beta: manual operator save only for this lead. This does not auto-trigger follow-up,
        estimate, handoff, or continuity mutations.
      </p>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={8}
        disabled={saving}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none disabled:opacity-60"
        placeholder="Internal follow-up details..."
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-70"
          title="Manual notes save (single lead only)"
        >
          {saving ? "Saving..." : "Save notes"}
        </button>
      </div>
      {notice ? <p className="text-xs text-slate-600">{notice}</p> : null}
    </div>
  );
}
