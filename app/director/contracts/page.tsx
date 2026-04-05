import { DirectorShell } from '@/app/director/DirectorShell';

export default function DirectorContractsPage() {
  return (
    <DirectorShell title="Contracts" subtitle="Contract checkpoints and obligations across all active director cases.">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
        Contracts board is enabled. Open a case workspace for contract-level execution details.
      </section>
    </DirectorShell>
  );
}
