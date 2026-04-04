"use client";

import { useState } from "react";
import type { SocialAutomationSnapshot, SocialPlatform } from "@/lib/socialAutomation/types";

type Props = { defaultSnapshot: SocialAutomationSnapshot };

const modeLabel = {
  manual_review: "Manual Review Mode",
  auto_draft: "Auto Draft Mode",
  controlled_auto_publish: "Controlled Auto Publish Mode",
} as const;

const platformLabels: Record<SocialPlatform, string> = {
  tiktok: "TikTok",
  instagram_reels: "Instagram",
  youtube_shorts: "YouTube",
};

export default function SocialAutomationWorkbench({ defaultSnapshot }: Props) {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [status, setStatus] = useState("");

  async function updateMode(mode: SocialAutomationSnapshot["mode"]) {
    const res = await fetch("/api/internal/social-automation/mode", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }) });
    const json = await res.json();
    setStatus(json.success ? `mode updated: ${mode}` : `mode error: ${json.error ?? "unknown"}`);
    if (json.success) await refresh();
  }

  async function triggerAuth(platform: SocialPlatform) {
    const res = await fetch("/api/internal/social-automation/oauth/initiate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform }) });
    const json = await res.json();
    setStatus(json.success ? `oauth initiated for ${platform}: state=${json.state}` : `oauth init failed for ${platform}: ${json.error}`);
  }

  async function refreshToken(platform: SocialPlatform) {
    const res = await fetch("/api/internal/social-automation/oauth/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform }) });
    const json = await res.json();
    setStatus(json.success ? `token refreshed for ${platform}` : `token refresh failed: ${json.error}`);
    if (json.success) await refresh();
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
        <p>publish downgraded draft/private/manual: {snapshot.degraded.publishDowngraded.join(",") || "none"}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Today’s Auto Plan</h3>
        <p className="text-xs text-slate-600">current mode: {modeLabel[snapshot.mode]} · controlled auto publish will downgrade automatically when platform capability is not public_ready.</p>
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
                <p className="font-semibold">{platformLabels[item.platform]} · {item.state}</p>
                <p>authorized: {item.accountId ? "yes" : "no"} · token expiry: {item.tokenExpiresAt ?? "n/a"}</p>
                <p>capability: {item.capability} ({item.capabilityReason})</p>
                <p>{item.oauthConfigured ? "oauth configured" : "not configured"} · {item.authRequired ? "auth required" : "auth ok"}</p>
                <div className="mt-1 flex gap-2">
                  <button className="rounded border px-2 py-1" onClick={() => triggerAuth(item.platform)}>Auth Initiate</button>
                  <button className="rounded border px-2 py-1" onClick={() => refreshToken(item.platform)}>Refresh Token</button>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Publish Queue</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {snapshot.queue.map((item) => (
              <li key={item.id} className="rounded bg-slate-50 p-2">
                {item.id} · {item.platform} · {item.status} · capability={item.capability} · visibility={item.payload.visibility}
                <br />lang={item.language} · cta={item.cta}
                {item.downgradeReason ? <><br />downgraded: {item.downgradeReason}</> : null}
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
                {item.channel} · {item.messageType} · lead={item.leadLevel} · urgency={item.urgency} · escalate={item.escalateToHuman ? "yes" : "no"}
                <br />action: {item.suggestedAction}
                <br />draft: {item.draft}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Analytics Snapshot (last 5 days)</h3>
          <p className="text-xs">goal met: {snapshot.fiveDayReview.goalMet ? "yes" : "no"}</p>
          <p className="text-xs">weak metrics: {snapshot.fiveDayReview.weakMetrics.join(",") || "none"}</p>
          <p className="text-xs">recommended action: {snapshot.fiveDayReview.recommendedAction}</p>
          <p className="text-xs">repeat/stop/expand: {snapshot.fiveDayReview.recommendation}</p>
          <p className="mt-1 text-xs">data source: {snapshot.analytics.map((item) => item.sourceType).join(", ")}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Draft Video Package Preview</h3>
        <ul className="mt-2 space-y-1 text-xs">
          {snapshot.videoTasks.map((task) => (
            <li key={task.id} className="rounded bg-slate-50 p-2">
              {task.output.postPackage.title}
              <br />caption: {task.output.postPackage.caption}
              <br />hashtags: {task.output.postPackage.hashtags.join(" ")}
              <br />pinned: {task.output.postPackage.pinnedComment}
              <br />subtitle: {task.output.postPackage.subtitleFilename} / {task.output.postPackage.subtitleManifest}
              <br />assets: {task.output.postPackage.assetList.join(", ") || "none"}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-slate-600">{status}</p>
    </div>
  );
}
