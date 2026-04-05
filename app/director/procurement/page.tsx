import { DirectorShell } from '@/app/director/DirectorShell';

export default function DirectorProcurementPage() {
  return (
    <DirectorShell title="Procurement" subtitle="Material and vendor coordination control surface.">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        Procurement tracker is enabled. Open a case workspace for line-item purchasing status.
      </section>
    </DirectorShell>
  );
}
