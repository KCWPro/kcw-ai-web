"use client";

import { useState } from "react";
import { adminWorkflowActions, directorLeadStatusLabels, type DirectorLeadStatus } from "@/lib/directorConsole/status";

export default function AdminWorkflowPanel({ leadId, currentStatus }: { leadId: string; currentStatus: DirectorLeadStatus }) {
  const [status, setStatus] = useState<DirectorLeadStatus>(currentStatus);
  const [notice, setNotice] = useState("");

  async function runAction(target: DirectorLeadStatus) {
    const res = await fetch(`/api/internal/leads/${encodeURIComponent(leadId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "status_update", payload: { status: target } }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setNotice(data?.error || "update failed");
      return;
    }
    setStatus(target);
    setNotice(`状态已更新为 ${directorLeadStatusLabels[target]}（内部手动动作）`);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Internal Actions</h3>
      <p className="text-sm">当前状态：{directorLeadStatusLabels[status]}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {adminWorkflowActions.map((action) => (
          <button key={action.key} className="rounded border border-slate-300 px-2 py-1 text-sm" onClick={() => runAction(action.key)}>
            {action.label}
          </button>
        ))}
      </div>
      {notice ? <p className="mt-2 text-xs text-slate-600">{notice}</p> : null}
    </section>
  );
}
