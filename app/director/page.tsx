export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { DirectorShell } from '@/app/director/DirectorShell';
import { listDirectorCases } from '@/lib/directorCasesStore';

export default function DirectorConsolePage() {
  const cases = listDirectorCases();
  const activeCount = cases.filter((item) => item.status === 'active').length;

  return (
    <DirectorShell title="Operational hub for leadership workflows." subtitle="Track active delivery risk, execution readiness, and cross-team blockers.">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Total Cases</p>
          <p className="mt-2 text-3xl font-semibold">{cases.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Active Cases</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{activeCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Quick Action</p>
          <Link href="/director/cases/create" className="mt-3 inline-flex rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            Create Director Case
          </Link>
        </article>
      </section>
    </DirectorShell>
  );
}
