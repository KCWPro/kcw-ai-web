import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DirectorShell } from '@/app/director/DirectorShell';
import { getDirectorCaseById } from '@/lib/directorCasesStore';

import { DIRECTOR_WORKSPACE_SECTION_TITLES } from '@/lib/directorWorkspace';

const workspaceSectionDetails: Record<(typeof DIRECTOR_WORKSPACE_SECTION_TITLES)[number], string> = {
  Engineering: 'Scope lock, sequencing, and field constraints for mechanical + plumbing execution.',
  Materials: 'Critical BOM, long-lead items, and supplier readiness gates.',
  Estimate: 'Budget posture, variance watchlist, and change-order assumptions.',
  Contract: 'Execution contract checkpoints, exclusions, and signature status.',
  Permit: 'Permit path ownership, city response SLA, and inspection milestones.',
  Procurement: 'PO queue, expediting status, and risk buffer on delivery windows.',
};

export default async function DirectorCaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const directorCase = getDirectorCaseById(id);

  if (!directorCase) {
    notFound();
  }

  return (
    <DirectorShell
      title={directorCase.title}
      subtitle={`Case workspace · ${directorCase.clientName || 'Client TBD'} · ${directorCase.address || 'Address pending'}`}
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Case Header</p>
        <p className="mt-2 text-sm text-slate-300">ID: {directorCase.id}</p>
        <p className="mt-1 text-sm text-slate-200">{directorCase.scopeSummary || 'Scope summary pending.'}</p>
        <div className="mt-3 flex gap-2 text-sm">
          <Link href="/director/cases" className="rounded-lg border border-slate-700 px-3 py-1.5 hover:border-cyan-600">
            Back to inbox
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DIRECTOR_WORKSPACE_SECTION_TITLES.map((sectionTitle) => (
          <article key={sectionTitle} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-base font-semibold text-cyan-100">{sectionTitle}</h2>
            <p className="mt-2 text-sm text-slate-300">{workspaceSectionDetails[sectionTitle]}</p>
          </article>
        ))}
      </section>
    </DirectorShell>
  );
}
