import { redirect } from 'next/navigation';
import { DirectorShell } from '@/app/director/DirectorShell';
import { createDirectorCase } from '@/lib/directorCasesStore';

async function createDirectorCaseAction(formData: FormData) {
  'use server';

  const created = createDirectorCase({
    title: String(formData.get('title') || ''),
    clientName: String(formData.get('clientName') || ''),
    address: String(formData.get('address') || ''),
    scopeSummary: String(formData.get('scopeSummary') || ''),
  });

  redirect(`/director/cases/${created.id}`);
}

export default function CreateDirectorCasePage() {
  return (
    <DirectorShell title="Create Director Case" subtitle="Seed a new execution workspace and route into the live case cockpit.">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <form action={createDirectorCaseAction} className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Case title</span>
            <input name="title" required className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" placeholder="e.g. Monterey Park repipe + permit recovery" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Client name</span>
            <input name="clientName" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-slate-300">Project address</span>
            <input name="address" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-slate-300">Scope summary</span>
            <textarea name="scopeSummary" rows={4} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" />
          </label>
          <button type="submit" className="inline-flex w-fit rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
            Create and open workspace
          </button>
        </form>
      </section>
    </DirectorShell>
  );
}
