import Link from "next/link";
import { directorStatusLabels } from "@/lib/director/statusMachine";
import { listDirectorCases } from "@/lib/director/store";

export default async function DirectorCasesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "all";
  const city = typeof params.city === "string" ? params.city : "all";
  const job = typeof params.job === "string" ? params.job : "all";
  const risk = typeof params.risk === "string" ? params.risk : "all";
  const source = typeof params.source === "string" ? params.source : "all";

  const cases = listDirectorCases().filter((entry) => {
    const c = entry.case_record;
    return (status === "all" || c.current_status === status)
      && (city === "all" || c.city === city)
      && (job === "all" || c.job_category === job)
      && (risk === "all" || c.risk_level === risk)
      && (source === "all" || c.source_type === source);
  });

  const allCases = listDirectorCases().map((item) => item.case_record);
  const cities = Array.from(new Set(allCases.map((item) => item.city).filter(Boolean)));
  const jobs = Array.from(new Set(allCases.map((item) => item.job_category).filter(Boolean)));

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Director Cases Inbox</h1>
        <form className="mt-3 grid gap-2 sm:grid-cols-5">
          <select name="status" defaultValue={status} className="rounded border px-2 py-2 text-sm"><option value="all">all status</option>{Object.entries(directorStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select name="city" defaultValue={city} className="rounded border px-2 py-2 text-sm"><option value="all">all city</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select name="job" defaultValue={job} className="rounded border px-2 py-2 text-sm"><option value="all">all job type</option>{jobs.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select name="risk" defaultValue={risk} className="rounded border px-2 py-2 text-sm"><option value="all">all risk</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
          <select name="source" defaultValue={source} className="rounded border px-2 py-2 text-sm"><option value="all">all source</option><option value="manual">manual</option><option value="imported_lead">imported from lead</option></select>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white sm:col-span-5">Apply Filters</button>
        </form>
      </section>
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b"><th>case_id</th><th>case title / customer</th><th>city</th><th>job type</th><th>source</th><th>status</th><th>risk</th><th>quote readiness</th><th>updated_at</th></tr></thead>
          <tbody>
            {cases.map(({ case_record: c }) => (
              <tr key={c.case_id} className="border-b align-top">
                <td className="py-2"><Link className="text-blue-700 underline" href={`/director/cases/${c.case_id}`}>{c.case_id}</Link></td>
                <td>{c.case_title}<div className="text-xs text-slate-500">{c.customer_name}</div></td>
                <td>{c.city}</td><td>{c.job_category}</td><td>{c.source_type}</td><td>{c.current_status}</td><td>{c.risk_level}</td><td>{c.quote_readiness}</td><td>{c.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
