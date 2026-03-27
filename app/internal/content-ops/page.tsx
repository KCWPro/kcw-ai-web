import Link from "next/link";
import { contentOpsSeeds, buildDailyPlannerSnapshot, buildPerformanceSnapshot } from "@/lib/contentOps";
import { commentReplyBank, dmReplyBank } from "@/lib/contentOps/interactionStudio";

export const dynamic = "force-dynamic";

export default function InternalContentOpsPage() {
  const daily = buildDailyPlannerSnapshot();
  const performance = buildPerformanceSnapshot();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">KCW Internal · Content Ops</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">KCW 短视频流量增长与变现 AI 运营系统</h1>
          <p className="mt-2 text-sm text-slate-600">
            优先级：真实可信 {'>'} 平台原生 {'>'} 持续日更 {'>'} lead 转化 {'>'} 增长 {'>'} 变现 {'>'} 自动化。
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Topics: {contentOpsSeeds.topicCount}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Script Samples: {contentOpsSeeds.scriptSamples.length}</span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">Templates: {contentOpsSeeds.scriptTemplates.length}</span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {daily.topThree.map((entry) => (
            <article key={entry.topic.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">今日推荐</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">{entry.topic.title}</h2>
              <p className="mt-2 text-xs text-slate-600">{entry.reason}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-700">
                <li>最省事：{entry.execution.fastest}</li>
                <li>标准：{entry.execution.standard}</li>
                <li>高质量：{entry.execution.premium}</li>
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">5-Day Review Center</h2>
            <p className="mt-2 text-sm text-slate-600">未达标：{performance.fiveDayReview.summary.not_met ? "是" : "否"}</p>
            <p className="text-sm text-slate-600">最弱项：{performance.fiveDayReview.summary.weakest_metric}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {performance.fiveDayReview.summary.missed_metrics.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">自动修正策略</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {performance.fiveDayReview.correction_plan.increase.map((item) => (
                <li key={item}>增加：{item}</li>
              ))}
              {performance.fiveDayReview.correction_plan.reduce.map((item) => (
                <li key={item}>减少：{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Monetization Planner</h2>
            <p className="mt-2 text-sm text-slate-700">当前阶段：{performance.monetization.stage}</p>
            <p className="text-sm text-slate-600">{performance.monetization.ordering_rule}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2">Lead Capture Fit: {performance.monetization.lead_capture_fit}</div>
              <div className="rounded-lg bg-slate-50 p-2">Affiliate Fit: {performance.monetization.affiliate_fit}</div>
              <div className="rounded-lg bg-slate-50 p-2">Sponsor Fit: {performance.monetization.sponsor_fit}</div>
              <div className="rounded-lg bg-slate-50 p-2">Platform Fit: {performance.monetization.platform_monetization_fit}</div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Interaction Studio</h2>
            <p className="mt-1 text-xs text-slate-500">评论区建议</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {commentReplyBank.map((item, index) => (
                <li key={`${item.comment_type}-${index}`} className="rounded-lg bg-slate-50 p-2">
                  <p className="font-medium">{item.comment_type}</p>
                  <p>{item.suggested_reply}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">DM 初筛模板</h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {dmReplyBank.map((item) => (
                <li key={item.inquiry_type} className="rounded-lg bg-slate-50 p-2">
                  <p className="font-medium">{item.inquiry_type}</p>
                  <p>{item.suggested_reply}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Module Coverage</h2>
          <p className="mt-2 text-sm text-slate-700">
            Dashboard / Topic Board / Script Studio / Content Calendar / Asset Library / Performance Review / 5-Day Review /
            Interaction Studio / Authenticity Control / Monetization Planner are implemented as internal modules and documented.
          </p>
          <div className="mt-4">
            <Link href="/docs" className="text-sm font-medium text-blue-700 underline underline-offset-2">
              相关文档见 docs/kcw-content-ops-*.md
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
