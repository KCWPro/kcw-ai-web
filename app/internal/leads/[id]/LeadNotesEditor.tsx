"use client";

import { useState } from "react";

type LeadNotesEditorProps = {
  leadId: string;
  initialNotes: string;
};

export default function LeadNotesEditor({ leadId, initialNotes }: LeadNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/internal/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internal_notes: notes }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to save internal notes");
      }

      setNotes(data.lead.internal_notes || "");
      setMessage("Internal notes saved.");
    } catch (error: unknown) {
      const messageText = error instanceof Error ? error.message : "Failed to save internal notes";
      setMessage(messageText);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Internal Notes</h2>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={8}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring"
        placeholder="Internal follow-up details..."
        disabled={saving}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save notes"}
        </button>
        {message ? <p className="text-xs text-slate-500">{message}</p> : null}
      </div>
    </div>
  );
}
