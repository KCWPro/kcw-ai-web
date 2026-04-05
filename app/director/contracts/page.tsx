import Link from "next/link";
import { listDirectorCases } from "@/lib/director/store";

export default function DirectorContractsPage() {
  const rows = listDirectorCases().filter((item) => item.contract || item.estimate);
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm"><h1 className="text-2xl font-semibold">Director Contract Center</h1><p className="text-sm text-slate-600">Contract drafts and estimate drafts generated from Director cases.</p></section>
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <table className="w-full text-sm"><thead><tr className="border-b"><th>Case</th><th>Estimate Draft</th><th>Contract Draft</th><th>Document Entry</th></tr></thead><tbody>{rows.map((item) => <tr key={item.case_record.case_id} className="border-b"><td>{item.case_record.case_id}</td><td>{item.estimate ? item.estimate.quote_readiness : "missing"}</td><td>{item.contract ? "available" : "placeholder"}</td><td><Link className="text-blue-700 underline" href={`/director/cases/${item.case_record.case_id}`}>Open Case Workspace</Link></td></tr>)}</tbody></table>
      </section>
    </div>
  );
}
