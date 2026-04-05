import { DirectorShell } from '@/app/director/DirectorShell';

export default function DirectorPermitsPage() {
  return (
    <DirectorShell title="Permits" subtitle="Permit readiness and inspection scheduling monitor.">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        Permit tracker is enabled. Open a case workspace for permit milestones.
      </section>
    </DirectorShell>
  );
}
