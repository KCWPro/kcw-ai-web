import { notFound } from "next/navigation";
import { getDirectorCaseById } from "@/lib/director/directorStore";
import { directorWorkspaceSections } from "@/lib/director/workspace";

function SectionCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
    </section>
  );
}

export default function DirectorCaseWorkspacePage({ params }: { params: { id: string } }) {
  const record = getDirectorCaseById(params.id);

  if (!record) {
    notFound();
  }

  return (
    <main className="space-y-4">
      <p className="text-xs uppercase tracking-wider text-cyan-300">Director Deep Workspace</p>

      <SectionCard title={directorWorkspaceSections[0]} body={`${record.title} · ${record.id}`} />
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title={directorWorkspaceSections[1]} body={record.engineering} />
        <SectionCard title={directorWorkspaceSections[2]} body={record.materials} />
        <SectionCard title={directorWorkspaceSections[3]} body={record.estimate} />
        <SectionCard title={directorWorkspaceSections[4]} body={record.contract} />
        <SectionCard title={directorWorkspaceSections[5]} body={record.permit} />
        <SectionCard title={directorWorkspaceSections[6]} body={record.procurement} />
      </div>
    </main>
  );
}
