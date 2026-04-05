export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { DirectorShell } from '@/app/director/DirectorShell';
import { listDirectorCases } from '@/lib/directorCasesStore';

export default function DirectorCasesInboxPage() {
  const cases = listDirectorCases();

  return (
    <DirectorShell title="Cases Inbox" subtitle="All director cases sorted by the most recent operational update.">
      <section className="space-y-3">
        {cases.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{item.id}</p>
                <h2 className="mt-1 text-lg font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-300">{item.clientName || 'Unknown client'} · {item.address || 'Address pending'}</p>
              </div>
              <Link href={`/director/cases/${item.id}`} className="inline-flex rounded-lg border border-cyan-700 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-950">
                Open workspace
              </Link>
            </div>
          </article>
        ))}
      </section>
    </DirectorShell>
  );
}
