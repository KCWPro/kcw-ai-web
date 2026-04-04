"use client";

import { useState } from "react";
import type { SocialAutomationSnapshot, SocialPlatform } from "@/lib/socialAutomation/types";

type Props = { defaultSnapshot: SocialAutomationSnapshot };

const modeLabel = {
  manual_review: "Manual (plan + draft only)",
  auto_draft: "Auto Draft (queue to draft/review)",
  controlled_auto_publish: "Controlled Auto Publish (gated)",
} as const;

export default function SocialAutomationWorkbench({ defaultSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [status, setStatus] = useState("");

  async function updateMode(mode: SocialAutomationSnapshot["mode"]) {
    const res = await fetch("/api/internal/social-automation/mode", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }) });
    const json = await res.json();
    setStatus(json.success ? `mode updated: ${mode}` : `mode error: ${json.error ?? "unknown"}`);
    await refresh();
  }

  async function refresh() {
    const res = await fetch("/api/internal/social-automation/overview");
    const json = await res.json();
    if (json.success) {
      setSnapshot(json.snapshot);
      setStatus("snapshot refreshed");
    }
  }

  async function initiateOAuth(platform: SocialPlatform) {
    const res = await fetch(`/api/internal/social-automation/oauth/${platform}/initiate`, { method: "POST" });
    const json = await res.json();
    setStatus(json.success ? `${platform} auth URL ready (contract scaffold).` : `${platform} initiate failed: ${json.error}`);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Safety / Degraded State Banner</p>
        <p>platform not connected: {snapshot.degraded.platformNotConnected.join(",") || "none"}</p>
        <p>token expired: {snapshot.degraded.tokenExpired.join(",") || "none"}</p>
        <p>audit restricted: {snapshot.degraded.auditRestricted.join(",") || "none"}</p>
        <p>publish downgraded: {snapshot.degraded.publishDowngraded.join(",") || "none"}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Mode Control</h3>
        <p className="text-xs text-slate-600">current mode: {modeLabel[snapshot.mode]}.</p>
        <div className="mt-2 flex gap-2 text-xs">
          <button className="rounded border px-2 py-1" onClick={() => updateMode("manual_review")}>Manual</button>
          <button className="rounded border px-2 py-1" onClick={() => updateMode("auto_draft")}>Auto Draft</button>
          <button className="rounded border px-2 py-1" onClick={() => updateMode("controlled_auto_publish")}>Controlled Auto Publish</button>
          <button className="rounded border px-2 py-1" onClick={refresh}>Refresh</button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Platform Connections</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {snapshot.connections.map((item) => (
              <li key={item.platform} className="rounded bg-slate-50 p-2">
                <p className="font-semibold">{item.platform}</p>
                <p>state: {item.state} · authorized: {item.hasToken ? "yes" : "no"} · token expires: {item.tokenExpiresAt ?? "-"}</p>
                <p>publish capability: {item.publishCapability} · reason: {item.capabilityReason}</p>
                <p>{item.authConfigured ? "oauth configured" : "oauth not configured"} · {item.authRequired ? "auth required" : "auth ok"}</p>
                <button className="mt-1 rounded border px-2 py-1" onClick={() => initiateOAuth(item.platform)}>Init OAuth Contract</button>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Publish Queue</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {snapshot.queue.map((item) => (
              <li key={item.id} className="rounded bg-slate-50 p-2">
                {item.id} · {item.platform} · {item.status} · lang={item.language} · CTA={item.cta} · capability={item.publishCapability} · visibility={item.payload.visibility} {item.downgradedReason ? `· downgraded:${item.downgradedReason}` : ""}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Draft Video Packages</h3>
        <ul className="mt-2 space-y-1 text-xs">
          {snapshot.videoTasks.map((task) => (
            <li key={task.id} className="rounded bg-slate-50 p-2">
              {task.id} · title={task.output.postPackage.publishPayload.title} · caption={task.output.postPackage.caption.slice(0, 32)} · hashtags={task.output.postPackage.hashtags.join(" ")} · pinned={task.output.postPackage.pinnedComment.slice(0, 24)} · subtitle={task.output.postPackage.subtitleFile} · assets={task.output.postPackage.assetManifest.join(",")}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Review / Reply Queue</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {snapshot.replyQueue.map((item) => (
              <li key={item.id} className="rounded bg-slate-50 p-2">
                {item.channel}/{item.messageType} · lead={item.leadIntent} · urgency={item.urgency} · escalate={item.escalateToHuman ? "yes" : "no"} · action={item.suggestedNextStep}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Analytics Snapshot (last 5 days)</h3>
          <p className="text-xs">goal met: {snapshot.fiveDayReview.goalMet ? "yes" : "no"}</p>
          <p className="text-xs">weak metrics: {snapshot.fiveDayReview.weakMetrics.join(",") || "none"}</p>
          <p className="text-xs">recommended action: {snapshot.fiveDayReview.recommendedAction}</p>
          <p className="text-xs">review decision: {snapshot.fiveDayReview.recommendation}</p>
          <p className="text-xs">source: {snapshot.analytics[0]?.source ?? "simulated/internal seed"}</p>
        </article>
      </section>

      <p className="text-xs text-slate-600">{status}</p>
    </div>
  );
}
