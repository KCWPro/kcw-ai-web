"use client";

import { useMemo, useState } from "react";
import { buildPerformanceSnapshot } from "@/lib/contentOps";
import { buildScriptStudioDraft } from "@/lib/contentOps/scriptStudio";
import { filterAssets } from "@/lib/contentOps/assetLibrary";

type Props = {
  defaultSnapshot: ReturnType<typeof buildPerformanceSnapshot>;
};

type UploadedAssetView = {
  asset_id: string;
  filename: string;
  preview_url: string;
  tags: string[];
  safe_for_public: boolean;
};

export default function ContentOpsWorkbench({ defaultSnapshot }: Props) {
  const [csvText, setCsvText] = useState("");
  const [sheetText, setSheetText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [hookVersionIndex, setHookVersionIndex] = useState(0);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [safeOnly, setSafeOnly] = useState(false);
  const [assetTagInput, setAssetTagInput] = useState("proof,b-roll");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAssetView[]>([]);

  const snapshot = useMemo(() => {
    if (csvText.trim()) return buildPerformanceSnapshot({ csvText });
    if (sheetText.trim()) return buildPerformanceSnapshot({ sheetText });
    return defaultSnapshot;
  }, [csvText, sheetText, defaultSnapshot]);

  const scriptDraft = useMemo(
    () => buildScriptStudioDraft(snapshot.scriptStudioBase, language, hookVersionIndex),
    [snapshot.scriptStudioBase, language, hookVersionIndex],
  );

  const filteredAssets = useMemo(
    () =>
      filterAssets(snapshot.assetLibrary.records, {
        serviceType: serviceTypeFilter === "all" ? undefined : serviceTypeFilter,
        safeForPublic: safeOnly ? true : undefined,
      }),
    [snapshot.assetLibrary.records, safeOnly, serviceTypeFilter],
  );

  async function onCsvFileChange(file: File | null) {
    if (!file) return;
    setCsvFileName(file.name);
    setCsvText(await file.text());
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

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-base font-semibold text-amber-900">Dashboard 顶部告警</h2>
        <p className="mt-1 text-sm text-amber-800">{snapshot.dashboardAlert.cycleStatus}</p>
        <p className="text-sm text-amber-800">最弱指标：{snapshot.dashboardAlert.weakestMetric}</p>
        <p className="text-sm text-amber-800">问题：{snapshot.dashboardAlert.criticalIssue}</p>
        <p className="text-sm text-amber-900">今日优先动作：{snapshot.dashboardAlert.todayPriority}</p>
        <p className="text-sm text-amber-900">{snapshot.dashboardAlert.monetizationStage} · {snapshot.dashboardAlert.ctaAdvice}</p>
        <p className="text-sm text-amber-900">{snapshot.dashboardAlert.executionOverview}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase D · 数据接入顺手化</h3>
          <p className="mt-1 text-xs text-slate-600">支持 CSV 文件上传与 Google Sheet 粘贴（tab 分隔）。</p>
          <input type="file" accept=".csv,text/csv" className="mt-2 text-xs" onChange={(e) => onCsvFileChange(e.target.files?.[0] ?? null)} />
          {csvFileName && <p className="text-xs text-slate-600">已选文件：{csvFileName}</p>}
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="粘贴 CSV（含 header）" className="mt-2 h-24 w-full rounded border p-2 text-xs" />
          <textarea value={sheetText} onChange={(e) => setSheetText(e.target.value)} placeholder="粘贴 Google Sheet 行列（tab 分隔）" className="mt-2 h-24 w-full rounded border p-2 text-xs" />
          <p className="mt-2 text-xs text-slate-700">当前来源：{snapshot.importSummary.source} · 记录数：{snapshot.importSummary.count}</p>
          {snapshot.importSummary.errors.length > 0 && <p className="text-xs text-rose-700">错误：{snapshot.importSummary.errors.join("; ")}</p>}
          <p className="text-xs text-slate-600">Sheet 预留：{snapshot.importSummary.sheetAdapter.provider} · {snapshot.importSummary.sheetAdapter.next_step}</p>
          <p className="mt-2 text-sm text-slate-700">5-day 达标：{snapshot.fiveDayReview.summary.not_met ? "未达标" : "达标"}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase A · 人工审核工作流</h3>
          <div className="mt-2 flex gap-2 text-xs">
            <button className="rounded border px-2 py-1" onClick={() => setLanguage("en")}>EN</button>
            <button className="rounded border px-2 py-1" onClick={() => setLanguage("zh")}>中文</button>
            <button className="rounded border px-2 py-1" onClick={() => setHookVersionIndex((v) => (v + 1) % 3)}>切换 Hook 版本</button>
          </div>
          <textarea value={scriptDraft.editableScript} readOnly className="mt-2 h-28 w-full rounded border p-2 text-xs" />
          <p className="mt-2 text-xs">Caption：{scriptDraft.generatedCaption}</p>
          <p className="text-xs">CTA：{scriptDraft.generatedCTA}</p>
          <p className="text-xs">Pinned comment：{scriptDraft.generatedPinnedComment}</p>
          <p className="mt-1 text-xs text-rose-700">真实性风险：{scriptDraft.authenticityRisk} · AI 味风险：{scriptDraft.aiSmellRisk}</p>
          <p className="mt-1 text-xs">审核状态：{scriptDraft.reviewStatus} · 人工审核优先：{scriptDraft.requiresManualReview ? "是" : "否"}</p>
          <p className="text-xs">Reviewer notes：{scriptDraft.reviewerNotes}</p>
          <p className="text-xs">版本历史：{scriptDraft.versionHistory.length} 条</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase B · Asset Library 真上传</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <select className="rounded border px-2 py-1" value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)}>
              <option value="all">all service type</option>
              <option value="drain_cleaning">drain_cleaning</option>
              <option value="inspection">inspection</option>
              <option value="water_heater">water_heater</option>
            </select>
            <label className="flex items-center gap-1"><input type="checkbox" checked={safeOnly} onChange={(e) => setSafeOnly(e.target.checked)} />safe_for_public</label>
          </div>
          <p className="mt-2 text-xs">筛选结果：{filteredAssets.length}</p>
          <div className="mt-2 rounded border border-dashed p-2 text-xs">
            <p className="font-medium">上传 / 标签 / safe_for_public / 关联绑定</p>
            <input type="file" className="mt-1" onChange={(e) => uploadAsset(e.target.files?.[0] ?? null)} />
            <input value={assetTagInput} onChange={(e) => setAssetTagInput(e.target.value)} className="mt-1 w-full rounded border p-1" placeholder="tag1,tag2" />
            <p className="mt-1 text-slate-600">{uploadStatus || "轻量上传，不引入重型媒体系统"}</p>
            <ul className="mt-1 space-y-1">
              {uploadedAssets.map((asset) => (
                <li key={asset.asset_id} className="rounded bg-slate-50 p-1">
                  <p>{asset.filename} · {asset.safe_for_public ? "safe" : "unsafe"}</p>
                  <p>tags: {asset.tags.join(", ") || "-"}</p>
                  <p className="truncate">preview: {asset.preview_url}</p>
                </li>
              ))}
            </ul>
          </div>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
            {snapshot.assetLibrary.missing.map((missing) => (
              <li key={missing}>{missing}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase C · 运营执行闭环</h3>
          <p className="mt-1 text-xs">状态：planned / filmed / edited / posted / reviewed</p>
          <p className="mt-1 text-xs">总任务：{snapshot.executionProgress.total} · posted：{snapshot.executionProgress.stageCount.posted}</p>
          <p className="text-xs">评论已回复：{snapshot.executionProgress.commentReplied} · 私信已处理：{snapshot.executionProgress.dmProcessed} · 高意向转人工：{snapshot.executionProgress.leadHandoff}</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {snapshot.postPlans.map((plan) => (
              <li key={plan.id}>{plan.id} · {plan.status} · review={plan.review_status} · versions={plan.version_history.length}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase E · 变现执行层</h3>
          <p className="mt-1 text-xs">策略：lead capture {'>'} affiliate/sponsor {'>'} platform payout</p>
          <p className="text-xs">阶段 CTA：{snapshot.monetization.ctaRecommendation}</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {snapshot.monetizationExecution.slice(0, 5).map((item) => (
              <li key={item.post_id}>{item.post_id} · {item.label} · {item.recommended_cta}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">重复度检测（最近20条）</h3>
          <p className="mt-1 text-xs">检测维度：标题 / hook / 脚本表达 / 结构。</p>
          <p className="text-xs">阻止发布推荐数量：{snapshot.duplication.blocked.length}</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {snapshot.duplication.risks.slice(0, 5).map((risk) => (
              <li key={risk.post_id}>
                {risk.post_id} · total {risk.totalRisk.toFixed(2)} · {risk.blockedFromRecommendation ? "blocked" : "ok"} · {risk.replacementDirection}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
