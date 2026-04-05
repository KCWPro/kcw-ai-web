import Link from "next/link";
import { getDirectorDashboardSnapshot } from "@/lib/director/store";

export default function DirectorDashboardPage() {
  const snapshot = getDirectorDashboardSnapshot();
  const cards: Array<{ label: string; value: number }> = [
    { label: "Director Cases 总数", value: snapshot.total_cases },
    { label: "新建案件数", value: snapshot.new_cases },
    { label: "待 AI 分析", value: snapshot.pending_ai_analysis },
    { label: "待工程判断", value: snapshot.pending_engineering },
    { label: "待报价", value: snapshot.pending_quote },
    { label: "待合同", value: snapshot.pending_contract },
    { label: "待 permit review", value: snapshot.pending_permit_review },
    { label: "待 procurement review", value: snapshot.pending_procurement_review },
    { label: "高风险案件", value: snapshot.high_risk_cases },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Director Console Dashboard</h1>
        <p className="text-sm text-slate-600">Independent KCW AI Director operating surface.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">最近创建案件</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {snapshot.recent_cases.map((item) => (
            <li key={item.case_id}>
              <Link className="text-blue-700 underline" href={`/director/cases/${item.case_id}`}>{item.case_id}</Link> · {item.case_title} · {item.city}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">快速入口</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Link className="rounded border px-3 py-2" href="/director/cases/new">New Director Case</Link>
          <Link className="rounded border px-3 py-2" href="/director/cases">Open Cases</Link>
          <Link className="rounded border px-3 py-2" href="/director/contracts">Contract Center</Link>
          <Link className="rounded border px-3 py-2" href="/director/permits">Permit Center</Link>
          <Link className="rounded border px-3 py-2" href="/director/procurement">Procurement Center</Link>
        </div>
      </section>
    </div>
  );
}
