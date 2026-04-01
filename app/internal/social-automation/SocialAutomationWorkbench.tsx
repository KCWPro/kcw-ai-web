"use client";

import { useState } from "react";
import type { SocialAutomationSnapshot } from "@/lib/socialAutomation/types";

type Props = { defaultSnapshot: SocialAutomationSnapshot };

const modeLabel = {
  manual_review: "Manual Review Mode",
  auto_draft: "Auto Draft Mode",
  controlled_auto_publish: "Controlled Auto Publish Mode",
} as const;

export default function SocialAutomationWorkbench({ defaultSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [status, setStatus] = useState("");

  async function updateMode(mode: SocialAutomationSnapshot["mode"]) {
    const res = await fetch("/api/internal/social-automation/mode", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }) });
    const json = await res.json();
    setStatus(json.success ? `mode updated: ${mode}` : `mode error: ${json.error ?? "unknown"}`);
  }

  async function refresh() {
    const res = await fetch("/api/internal/social-automation/overview");
    const json = await res.json();
    if (json.success) {
      setSnapshot(json.snapshot);
      setStatus("snapshot refreshed");
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Safety / Degraded State Banner</p>
        <p>platform not connected: {snapshot.degraded.platformNotConnected.join(",") || "none"}</p>
        <p>token expired: {snapshot.degraded.tokenExpired.join(",") || "none"}</p>
        <p>audit restricted: {snapshot.degraded.auditRestricted.join(",") || "none"}</p>
        <p>publish downgraded draft/private: {snapshot.degraded.publishDowngraded.join(",") || "none"}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Today’s Auto Plan</h3>
        <p className="text-xs text-slate-600">current mode: {modeLabel[snapshot.mode]} · default requires manual confirm in manual/auto draft modes.</p>
        <div className="mt-2 flex gap-2 text-xs">
          <button className="rounded border px-2 py-1" onClick={() => updateMode("manual_review")}>Manual</button>
          <button className="rounded border px-2 py-1" onClick={() => updateMode("auto_draft")}>Auto Draft</button>
          <button className="rounded border px-2 py-1" onClick={() => updateMode("controlled_auto_publish")}>Controlled Auto Publish</button>
          <button className="rounded border px-2 py-1" onClick={refresh}>Refresh</button>
        </div>
        <ul className="mt-2 space-y-1 text-xs">
          {snapshot.todayPlan.map((item) => (
            <li key={item.id} className="rounded bg-slate-50 p-2">
              {item.title} · {item.targetPlatform} · {item.targetLanguage} · CTA: {item.recommendedCTA}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Platform Connections</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {snapshot.connections.map((item) => (
              <li key={item.platform} className="rounded bg-slate-50 p-2">
                {item.platform} · {item.state} · scopes {item.scopeStatus} · expires {item.tokenExpiresAt ?? "-"}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Publish Queue</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {snapshot.queue.map((item) => (
              <li key={item.id} className="rounded bg-slate-50 p-2">
                {item.id} · {item.platform} · {item.status} · visibility={item.payload.visibility}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Review / Reply Queue</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {snapshot.replyQueue.map((item) => (
              <li key={item.id} className="rounded bg-slate-50 p-2">
                {item.channel} · {item.inquiry} · lead={item.leadIntent} · escalate={item.escalateToHuman ? "yes" : "no"}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Analytics Snapshot (last 5 days)</h3>
          <p className="text-xs">goal met: {snapshot.fiveDayReview.goalMet ? "yes" : "no"}</p>
          <p className="text-xs">weak metrics: {snapshot.fiveDayReview.weakMetrics.join(",") || "none"}</p>
          <p className="text-xs">recommendation: {snapshot.fiveDayReview.recommendation}</p>
        </article>
      </section>

      <p className="text-xs text-slate-600">{status}</p>
    </div>
  );
}
