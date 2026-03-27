"use client";

import { useMemo, useState } from "react";
import { buildScriptStudioDraft } from "@/lib/contentOps/scriptStudio";
import { filterAssets } from "@/lib/contentOps/assetLibrary";
import type { MonetizationExecutionLabel } from "@/lib/contentOps/types";

type Props = {
  defaultSnapshot: any;
};

type UploadedAssetView = {
  asset_id: string;
  filename: string;
  preview_url: string;
  tags: string[];
  safe_for_public: boolean;
  service_type?: string;
  notes?: string;
};

export default function ContentOpsWorkbench({ defaultSnapshot }: Props) {
  const [csvText, setCsvText] = useState("");
  const [sheetText, setSheetText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [hookVersionIndex, setHookVersionIndex] = useState(0);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [safeOnly, setSafeOnly] = useState(false);
  const [beforeAfterOnly, setBeforeAfterOnly] = useState(false);
  const [bRollOnly, setBRollOnly] = useState(false);
  const [talkingHeadOnly, setTalkingHeadOnly] = useState(false);
  const [assetTagInput, setAssetTagInput] = useState("proof,b-roll");
  const [uploadStatus, setUploadStatus] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState(defaultSnapshot.scriptStudioBase.reviewer_notes ?? "");
  const [interactionStatus, setInteractionStatus] = useState("");
  const [monetizationStatus, setMonetizationStatus] = useState("");

  const snapshot = defaultSnapshot;

  const [uploadedAssets, setUploadedAssets] = useState<UploadedAssetView[]>(() =>
    snapshot.assetLibrary.records.slice(0, 20).map((asset: any) => ({
      asset_id: asset.asset_id,
      filename: asset.filename,
      preview_url: asset.preview_url,
      tags: asset.tags,
      safe_for_public: asset.safe_for_public,
      service_type: asset.service_type,
      notes: asset.notes,
    })),
  );

  const scriptDraft = useMemo(
    () => buildScriptStudioDraft(snapshot.scriptStudioBase, language, hookVersionIndex),
    [snapshot.scriptStudioBase, language, hookVersionIndex],
  );

  const filteredAssets = useMemo(
    () =>
      filterAssets(uploadedAssets as never[], {
        serviceType: serviceTypeFilter === "all" ? undefined : serviceTypeFilter,
        safeForPublic: safeOnly ? true : undefined,
        beforeAfter: beforeAfterOnly ? true : undefined,
        bRoll: bRollOnly ? true : undefined,
        talkingHeadCompatible: talkingHeadOnly ? true : undefined,
      }),
    [uploadedAssets, safeOnly, serviceTypeFilter, beforeAfterOnly, bRollOnly, talkingHeadOnly],
  );

  async function onCsvFileChange(file: File | null) {
    if (!file) return;
    setCsvFileName(file.name);
    const text = await file.text();
    setCsvText(text);
    await fetch("/api/internal/content-ops/import", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "csv", cycleQualified: !snapshot.fiveDayReview.summary.not_met }),
    });
  }

  async function uploadAsset(file: File | null) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const payload = {
      filename: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size_bytes: file.size,
      preview_url: preview,
      tags: assetTagInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      safe_for_public: safeOnly,
      topic_id: snapshot.scriptStudioBase.topic_id,
      script_id: snapshot.scriptStudioBase.id,
      post_plan_id: snapshot.postPlans[0]?.id,
      service_type: serviceTypeFilter === "all" ? "general" : serviceTypeFilter,
    };

    const response = await fetch("/api/internal/content-ops/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as {
      success: boolean;
      asset?: UploadedAssetView;
    };

    if (!json.success || !json.asset) {
      setUploadStatus("上传失败");
      return;
    }

    setUploadedAssets((prev) => [json.asset!, ...prev]);
    setUploadStatus(`上传成功：${json.asset.filename}`);
  }

  async function updateReview(action: "mark_reviewed" | "approve" | "reject" | "revert_to_draft") {
    const response = await fetch("/api/internal/content-ops/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "script",
        id: scriptDraft.scriptId,
        action,
        reviewer_notes: reviewerNotes,
        updated_by: "content_ops_workbench",
      }),
    });
    const json = await response.json();
    setInteractionStatus(json.success ? `审核动作已执行：${action}` : `审核失败：${json.error ?? "unknown"}`);
  }

  async function updateExecution(taskId: string, patch: Record<string, unknown>) {
    const response = await fetch("/api/internal/content-ops/execution", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId, ...patch }),
    });
    const json = await response.json();
    setInteractionStatus(json.success ? `执行更新成功：${taskId}` : `执行更新失败：${json.error ?? "unknown"}`);
  }

  async function markInteractionEscalated(id: string) {
    const response = await fetch("/api/internal/content-ops/interaction", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "escalated", handoff_to_human: true }),
    });
    const json = await response.json();
    setInteractionStatus(json.success ? `线索已转人工：${id}` : `线索更新失败：${json.error ?? "unknown"}`);
  }

  async function overrideMonetization(postId: string, label: MonetizationExecutionLabel) {
    const response = await fetch("/api/internal/content-ops/monetization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, label }),
    });
    const json = await response.json();
    setMonetizationStatus(json.success ? `已 override ${postId} -> ${label}` : `override 失败：${json.error ?? "unknown"}`);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-base font-semibold text-amber-900">Content Ops 驾驶台</h2>
        <p className="mt-1 text-sm text-amber-800">今日发什么：{snapshot.postPlans[0]?.id ?? "-"}</p>
        <p className="text-sm text-amber-800">已审核通过内容：{snapshot.reviewFunnel.approved}</p>
        <p className="text-sm text-amber-800">缺素材提醒：{snapshot.assetLibrary.missing.length}</p>
        <p className="text-sm text-amber-800">5-day 达标：{snapshot.fiveDayReview.summary.not_met ? "未达标" : "达标"}</p>
        <p className="text-sm text-amber-800">最弱指标：{snapshot.dashboardAlert.weakestMetric}</p>
        <p className="text-sm text-amber-800">执行进度：{snapshot.executionProgress.completed}/{snapshot.executionProgress.total}</p>
        <p className="text-sm text-amber-800">待回复评论/DM/hot lead：{snapshot.interactionBacklog.pendingComments}/{snapshot.interactionBacklog.pendingDms}/{snapshot.interactionBacklog.pendingHotLeads}</p>
        <p className="text-sm text-amber-900">变现阶段：{snapshot.monetization.stage} · 推荐 CTA：{snapshot.monetization.ctaRecommendation}</p>
        <p className="text-sm text-amber-900">重复风险最高：{snapshot.duplication.highestRisk?.post_id ?? "-"}</p>
        <p className="text-sm text-amber-900">今日最优先动作：{snapshot.executionProgress.todayPriorityAction}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">A/H 审核流 + Script Studio</h3>
          <div className="mt-2 flex gap-2 text-xs">
            <button className="rounded border px-2 py-1" onClick={() => setLanguage("en")}>EN</button>
            <button className="rounded border px-2 py-1" onClick={() => setLanguage("zh")}>中文</button>
            <button className="rounded border px-2 py-1" onClick={() => setHookVersionIndex((v) => (v + 1) % 3)}>切换 Hook</button>
          </div>
          <textarea value={scriptDraft.editableScript} readOnly className="mt-2 h-24 w-full rounded border p-2 text-xs" />
          <textarea value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} className="mt-2 h-16 w-full rounded border p-2 text-xs" placeholder="reviewer notes" />
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button className="rounded border px-2 py-1" onClick={() => updateReview("mark_reviewed")}>mark reviewed</button>
            <button className="rounded border px-2 py-1" onClick={() => updateReview("approve")}>approve</button>
            <button className="rounded border px-2 py-1" onClick={() => updateReview("reject")}>reject</button>
            <button className="rounded border px-2 py-1" onClick={() => updateReview("revert_to_draft")}>revert draft</button>
          </div>
          <p className="mt-1 text-xs">Caption：{scriptDraft.generatedCaption}</p>
          <p className="text-xs">CTA：{scriptDraft.generatedCTA}</p>
          <p className="text-xs">Pinned：{scriptDraft.generatedPinnedComment}</p>
          <p className="mt-1 text-xs">realism={scriptDraft.realismScore} | ai={scriptDraft.aiSmellRisk} | exaggeration={scriptDraft.exaggerationRisk} | duplication={scriptDraft.duplicationRisk}</p>
          <p className="text-xs">review={scriptDraft.reviewStatus} | manual review={scriptDraft.requiresManualReview ? "yes" : "no"}</p>
          <p className="text-xs">version history={scriptDraft.versionHistory.length}</p>
          {scriptDraft.publishBlocked && <p className="mt-1 text-xs font-semibold text-rose-700">高风险：不可直接发布（需人工审核通过）。</p>}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">D 数据接入 + 周期状态</h3>
          <input type="file" accept=".csv,text/csv" className="mt-2 text-xs" onChange={(e) => onCsvFileChange(e.target.files?.[0] ?? null)} />
          {csvFileName && <p className="text-xs text-slate-600">已选文件：{csvFileName}</p>}
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="CSV" className="mt-2 h-16 w-full rounded border p-2 text-xs" />
          <textarea value={sheetText} onChange={(e) => setSheetText(e.target.value)} placeholder="Sheet TSV" className="mt-2 h-16 w-full rounded border p-2 text-xs" />
          <p className="mt-2 text-xs">当前数据源：{snapshot.importSummary.currentSource} ({snapshot.importSummary.source})</p>
          <p className="text-xs">最近导入：{snapshot.importSummary.lastImportedAt}</p>
          <p className="text-xs">当前周期：{snapshot.importSummary.cycleQualified ? "达标" : "未达标"}</p>
          <p className="text-xs">Sheet adapter: {snapshot.importSummary.sheetAdapter.provider} / {snapshot.importSummary.sheetAdapter.next_step}</p>
          {snapshot.importSummary.errors.length > 0 && <p className="text-xs text-rose-700">导入错误：{snapshot.importSummary.errors.join("; ")}</p>}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">B Asset Library</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <select className="rounded border px-2 py-1" value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)}>
              <option value="all">all</option>
              <option value="drain_cleaning">drain_cleaning</option>
              <option value="inspection">inspection</option>
              <option value="water_heater">water_heater</option>
            </select>
            <input value={assetTagInput} onChange={(e) => setAssetTagInput(e.target.value)} className="rounded border p-1" placeholder="tags" />
            <label><input type="checkbox" checked={safeOnly} onChange={(e) => setSafeOnly(e.target.checked)} /> safe</label>
            <label><input type="checkbox" checked={beforeAfterOnly} onChange={(e) => setBeforeAfterOnly(e.target.checked)} /> before/after</label>
            <label><input type="checkbox" checked={bRollOnly} onChange={(e) => setBRollOnly(e.target.checked)} /> b-roll</label>
            <label><input type="checkbox" checked={talkingHeadOnly} onChange={(e) => setTalkingHeadOnly(e.target.checked)} /> talking-head</label>
          </div>
          <input type="file" className="mt-2" onChange={(e) => uploadAsset(e.target.files?.[0] ?? null)} />
          <p className="mt-1 text-xs">{uploadStatus || "上传后持久化到本地 JSON"}</p>
          <p className="text-xs">筛选结果：{filteredAssets.length}</p>
          <ul className="mt-1 max-h-32 space-y-1 overflow-auto text-xs">
            {filteredAssets.slice(0, 10).map((asset) => (
              <li key={asset.asset_id} className="rounded bg-slate-50 p-1">
                {asset.filename} · {asset.service_type ?? "-"} · {asset.safe_for_public ? "safe" : "unsafe"}
              </li>
            ))}
          </ul>
          <ul className="mt-2 list-disc pl-5 text-xs text-rose-700">
            {snapshot.assetLibrary.missing.map((missing: string) => (
              <li key={missing}>{missing}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">C/F 执行闭环 + 互动线索</h3>
          <p className="mt-1 text-xs">任务总数 {snapshot.executionProgress.total} / 已完成 {snapshot.executionProgress.completed} / 未完成 {snapshot.executionProgress.incomplete}</p>
          <p className="text-xs">卡住最多步骤：{snapshot.executionProgress.bottleneckStage}</p>
          <ul className="mt-2 space-y-1 text-xs">
            {defaultSnapshot.executionBoard.map((task: any, index: number) => (
              <li key={`${task.date}-${index}`} className="rounded bg-slate-50 p-2">
                {task.date} · {task.status}
                <button className="ml-2 rounded border px-1" onClick={() => updateExecution(defaultSnapshot.executionBoard[index] ? `task_${defaultSnapshot.postPlans[index]?.id}` : "", { checked_in: true })}>完成打卡</button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">待回复评论 {snapshot.interactionBacklog.pendingComments} / 待处理DM {snapshot.interactionBacklog.pendingDms} / hot lead {snapshot.interactionBacklog.pendingHotLeads}</p>
          <ul className="mt-1 space-y-1 text-xs">
            {snapshot.interactions.slice(0, 5).map((item: any) => (
              <li key={item.id} className="rounded bg-slate-50 p-2">
                {item.id} · {item.channel} · {item.status} · intent {item.intent_level} · urgency {item.urgency_level}
                {item.risk_flag && <span className="ml-1 font-semibold text-rose-700">[高风险]</span>}
                {item.intent_level === "high" && <button className="ml-2 rounded border px-1" onClick={() => markInteractionEscalated(item.id)}>转人工</button>}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">E/G/I 变现执行 + 重复防机械化 + 审核漏斗</h3>
        <p className="text-xs">审核漏斗 draft/reviewed/approved/rejected: {snapshot.reviewFunnel.draft}/{snapshot.reviewFunnel.reviewed}/{snapshot.reviewFunnel.approved}/{snapshot.reviewFunnel.rejected}</p>
        <p className="text-xs">重复阈值：{snapshot.duplication.threshold}（platform={snapshot.duplicationSettings.groupByPlatform ? "on" : "off"}, language={snapshot.duplicationSettings.groupByLanguage ? "on" : "off"}）</p>
        <p className="text-xs">超阈值阻断推荐：{snapshot.duplication.blocked.length}</p>
        <ul className="mt-2 space-y-1 text-xs">
          {snapshot.monetizationExecution.slice(0, 5).map((item: any) => (
            <li key={item.post_id} className="rounded bg-slate-50 p-2">
              {item.post_id} · {item.label} · {item.recommended_cta}
              <button className="ml-2 rounded border px-1" onClick={() => overrideMonetization(item.post_id, "lead_capture")}>override lead</button>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-slate-600">{monetizationStatus}</p>
        <p className="mt-1 text-xs text-slate-600">{interactionStatus}</p>
      </section>
    </div>
  );
}
