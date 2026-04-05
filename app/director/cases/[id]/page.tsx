type CaseDetailPageProps = {
  params: {
    id: string;
  };
};

const milestones = [
  "Director intake approved",
  "Contract packet in legal review",
  "Permit filing package assembled",
  "Material lock before field mobilization",
];

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const caseId = decodeURIComponent(params.id);

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Director Case Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{caseId}</h2>
        <p className="mt-2 text-sm text-slate-300">
          Command detail view for lifecycle status, obligations, and release-readiness controls.
        </p>
      </header>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold text-cyan-100">Milestone Checklist</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {milestones.map((item) => (
            <li key={item} className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
