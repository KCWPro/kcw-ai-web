import NewDirectorCaseForm from "@/components/director/NewDirectorCaseForm";

export default function DirectorNewCasePage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Manual Case Creation · New Director Case Builder</h1>
        <p className="text-sm text-slate-600">Primary workflow: New Case → Run AI Director Analysis → Open Workspace.</p>
      </section>
      <NewDirectorCaseForm />
    </div>
  );
}
