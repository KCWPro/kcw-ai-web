const fields = [
  "Project title",
  "Site address",
  "Primary scope",
  "Contract target date",
  "Permit dependency notes",
  "Procurement lead-time risk",
];

export default function NewDirectorCasePage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Create Director Case</h2>
        <p className="text-sm text-slate-300">
          Intake form for opening a new executive-controlled case in the Director Console v1 flow.
        </p>
      </div>

      <form className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6" action="#" method="post">
        {fields.map((field) => (
          <label key={field} className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">{field}</span>
            <input
              type="text"
              name={field.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/60 transition focus:ring"
              placeholder={`Enter ${field.toLowerCase()}`}
            />
          </label>
        ))}

        <button
          type="submit"
          className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20"
        >
          Save draft case
        </button>
      </form>
    </section>
  );
}
