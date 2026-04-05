const permitPipeline = [
  { city: "Los Angeles", project: "Multi-unit drain retrofit", phase: "Plan check", nextAction: "Submit revised fixture schedule" },
  { city: "Santa Monica", project: "Backflow prevention upgrade", phase: "Inspection", nextAction: "Coordinate final inspector window" },
  { city: "Culver City", project: "Gas manifold replacement", phase: "Application", nextAction: "Complete contractor affidavit" },
];

export default function DirectorPermitsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Permit Assurance</h2>
        <p className="text-sm text-slate-300">Municipal permit sequencing and inspection readiness under director supervision.</p>
      </div>

      <div className="space-y-3">
        {permitPipeline.map((item) => (
          <article key={`${item.city}-${item.project}`} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-300">{item.city}</p>
            <h3 className="mt-1 text-base font-semibold text-white">{item.project}</h3>
            <p className="mt-2 text-sm text-slate-300">Phase: {item.phase}</p>
            <p className="text-sm text-slate-300">Next: {item.nextAction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
