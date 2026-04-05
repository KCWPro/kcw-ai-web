import Link from "next/link";

const commandCards = [
  {
    title: "Case Command",
    href: "/director/cases",
    detail: "Open and steer active construction and plumbing delivery cases with direct owner-level control.",
  },
  {
    title: "Contract Readiness",
    href: "/director/contracts",
    detail: "Track legal packet readiness and obligation checkpoints before execution.",
  },
  {
    title: "Permit Assurance",
    href: "/director/permits",
    detail: "Maintain permit filing status, inspection windows, and municipal dependencies.",
  },
  {
    title: "Procurement Flow",
    href: "/director/procurement",
    detail: "Supervise material commitments, vendor sequence, and lead-time risk before field release.",
  },
];

export default function DirectorConsolePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-cyan-400/30 bg-slate-900 p-6 shadow-lg shadow-cyan-900/20">
        <h2 className="text-2xl font-semibold text-white">Director Console</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          This is the standalone KCW AI Director Console v1 surface. It is organized around command ownership domains and
          operates independently as `/director` routes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {commandCards.map((card) => (
          <article key={card.title} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-cyan-100">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{card.detail}</p>
            <Link
              href={card.href}
              className="mt-4 inline-flex rounded-md border border-cyan-400/40 bg-slate-800 px-3 py-1.5 text-sm font-medium text-cyan-100 hover:bg-slate-700"
            >
              Open module
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
