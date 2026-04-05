import Link from "next/link";

type DirectorCase = {
  id: string;
  name: string;
  stage: "Intake" | "Contract" | "Permit" | "Execution";
  risk: "Low" | "Medium" | "High";
  owner: string;
};

const cases: DirectorCase[] = [
  { id: "DC-2401", name: "Wilshire Tower Main Line Replacement", stage: "Permit", risk: "High", owner: "Director A" },
  { id: "DC-2402", name: "Culver Duplex Gas Upgrade", stage: "Contract", risk: "Medium", owner: "Director B" },
  { id: "DC-2403", name: "Echo Park Restaurant Drain Retrofit", stage: "Execution", risk: "Low", owner: "Director C" },
];

export default function DirectorCasesPage() {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">Case Command Board</h2>
          <p className="text-sm text-slate-300">Active director-owned cases with stage and risk visibility.</p>
        </div>
        <Link
          href="/director/cases/new"
          className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20"
        >
          Create new case
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 bg-slate-900 text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-3">Case ID</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {cases.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-cyan-100">
                  <Link href={`/director/cases/${item.id}`} className="hover:underline">
                    {item.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.stage}</td>
                <td className="px-4 py-3">{item.risk}</td>
                <td className="px-4 py-3">{item.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
