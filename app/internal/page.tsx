import Link from "next/link";
import { readInternalLeadsFromGoogleSheet } from "@/lib/internalLeadsStore";
import { internalLeads } from "@/lib/internalLeads";
import { directorLeadStatusLabels, type DirectorLeadStatus } from "@/lib/directorConsole/status";
import { toDirectorLeads } from "@/lib/directorConsole/mockData";

function metric(label: string, count: number, href: string) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{count}</p>
    </Link>
  );
}

export default async function InternalDashboardPage() {
  const rows = await readInternalLeadsFromGoogleSheet().catch(() => []);
  const source = rows.length ? rows : internalLeads;
  const leads = toDirectorLeads(source as never[]);

  const countBy = (status: DirectorLeadStatus) => leads.filter((lead) => lead.status === status).length;
  const highRisk = leads.filter((lead) => lead.risk_level === "high" || lead.risk_level === "critical").length;
  const urgent = leads.filter((lead) => lead.urgency === "high").length;

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">KCW Director Console v1</h1>
        <p className="text-sm text-slate-500">Internal dashboard with state-based triage, risk queue, and lead drill-down.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {metric("新 lead 数量", countBy("new"), "/internal/leads?status=new")}
        {metric("待媒体审核", countBy("media_pending_review"), "/internal/leads?status=media_pending_review")}
        {metric("待视觉诊断", countBy("diagnosis_in_progress"), "/internal/leads?status=diagnosis_in_progress")}
        {metric("待工程判断", countBy("engineering_review_pending"), "/internal/leads?status=engineering_review_pending")}
        {metric("待报价", countBy("estimate_pending"), "/internal/leads?status=estimate_pending")}
        {metric("待合同", countBy("contract_pending"), "/internal/leads?status=contract_pending")}
        {metric("待 permit 审核", countBy("permit_review_pending"), "/internal/leads?status=permit_review_pending")}
        {metric("待跟进", countBy("follow_up_pending"), "/internal/leads?status=follow_up_pending")}
        {metric("高风险案件", highRisk, "/internal/leads?risk=high")}
        {metric("紧急案件", urgent, "/internal/leads?urgency=high")}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">状态分布 / 基础筛选入口</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {Object.entries(directorLeadStatusLabels).map(([status, label]) => (
            <Link key={status} href={`/internal/leads?status=${status}`} className="rounded border border-slate-300 px-2 py-1">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
