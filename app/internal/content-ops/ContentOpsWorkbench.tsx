"use client";

import { useMemo, useState } from "react";
import { buildPerformanceSnapshot } from "@/lib/contentOps";
import { buildScriptStudioDraft } from "@/lib/contentOps/scriptStudio";
import { filterAssets } from "@/lib/contentOps/assetLibrary";

type Props = {
  defaultSnapshot: ReturnType<typeof buildPerformanceSnapshot>;
};

export default function ContentOpsWorkbench({ defaultSnapshot }: Props) {
  const [csvText, setCsvText] = useState("");
  const [sheetText, setSheetText] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [hookVersionIndex, setHookVersionIndex] = useState(0);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [safeOnly, setSafeOnly] = useState(false);

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

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-base font-semibold text-amber-900">Dashboard 顶部告警</h2>
        <p className="mt-1 text-sm text-amber-800">{snapshot.dashboardAlert.cycleStatus}</p>
        <p className="text-sm text-amber-800">最弱指标：{snapshot.dashboardAlert.weakestMetric}</p>
        <p className="text-sm text-amber-800">问题：{snapshot.dashboardAlert.criticalIssue}</p>
        <p className="text-sm text-amber-900">今日优先动作：{snapshot.dashboardAlert.todayPriority}</p>
        <p className="text-sm text-amber-900">{snapshot.dashboardAlert.monetizationStage} · {snapshot.dashboardAlert.ctaAdvice}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase A · 真实数据导入</h3>
          <p className="mt-1 text-xs text-slate-600">支持 CSV 上传文本或 Google Sheet 粘贴（tab 分隔）。</p>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="粘贴 CSV（含 header）" className="mt-2 h-24 w-full rounded border p-2 text-xs" />
          <textarea value={sheetText} onChange={(e) => setSheetText(e.target.value)} placeholder="粘贴 Google Sheet 行列（tab 分隔）" className="mt-2 h-24 w-full rounded border p-2 text-xs" />
          <p className="mt-2 text-xs text-slate-700">当前来源：{snapshot.importSummary.source} · 记录数：{snapshot.importSummary.count}</p>
          {snapshot.importSummary.errors.length > 0 && <p className="text-xs text-rose-700">错误：{snapshot.importSummary.errors.join("; ")}</p>}
          <p className="mt-2 text-sm text-slate-700">5-day 达标：{snapshot.fiveDayReview.summary.not_met ? "未达标" : "达标"}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase B · Script Studio 强化</h3>
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
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase C · Asset Library</h3>
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
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-700">
            {snapshot.assetLibrary.missing.map((missing) => (
              <li key={missing}>{missing}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs">素材可关联：topic / script / post plan（AssetBinding）。</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">Phase D · 重复度检测（最近20条）</h3>
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
