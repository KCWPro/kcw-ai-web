const contractQueue = [
  { id: "CT-801", scope: "Emergency line reroute", status: "Signature pending", blocker: "Counterparty redline" },
  { id: "CT-802", scope: "Commercial tenant improvement", status: "In legal review", blocker: "Insurance exhibit" },
  { id: "CT-803", scope: "Water heater portfolio service", status: "Ready to execute", blocker: "None" },
];

export default function DirectorContractsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Contract Control</h2>
        <p className="text-sm text-slate-300">Director-level agreement readiness board for active commitments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {contractQueue.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-300">{item.id}</p>
            <h3 className="mt-1 text-base font-semibold text-white">{item.scope}</h3>
            <p className="mt-2 text-sm text-slate-300">Status: {item.status}</p>
            <p className="mt-1 text-sm text-slate-300">Blocker: {item.blocker}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
