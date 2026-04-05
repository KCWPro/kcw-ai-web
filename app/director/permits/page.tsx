import Link from "next/link";
import { listDirectorCases } from "@/lib/director/store";

export default async function DirectorPermitsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "all";
  const status = typeof params.status === "string" ? params.status : "all";
  const rows = listDirectorCases().filter((item) => item.permit_review).map((item) => item.permit_review!);
  const cities = Array.from(new Set(rows.map((item) => item.city)));
  const filtered = rows.filter((item) => (city === "all" || item.city === city) && (status === "all" || item.permit_status === status));

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm"><h1 className="text-2xl font-semibold">Director Permit Center</h1><p className="text-sm text-slate-600">Permit review queue with city and status filters.</p></section>
      <form className="grid gap-2 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3"><select name="city" defaultValue={city} className="rounded border px-2 py-2 text-sm"><option value="all">all city</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select><select name="status" defaultValue={status} className="rounded border px-2 py-2 text-sm"><option value="all">all status</option><option value="not_started">not_started</option><option value="needs_review">needs_review</option><option value="verified">verified</option></select><button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Apply Filters</button></form>
      <section className="rounded-xl bg-white p-4 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b"><th>Case</th><th>City</th><th>Verdict</th><th>Status</th><th>manual verification</th><th>Open</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.case_id} className="border-b"><td>{item.case_id}</td><td>{item.city}</td><td>{item.permit_requirement_verdict}</td><td>{item.permit_status}</td><td>{String(item.manual_verification_needed)}</td><td><Link className="text-blue-700 underline" href={`/director/cases/${item.case_id}`}>Open Case</Link></td></tr>)}</tbody></table></section>
    </div>
  );
}
