import Link from "next/link";
import { createDirectorCaseAction } from "./actions";

export default function CreateDirectorCasePage() {
  return (
    <main className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-2xl font-semibold">Create Director Case</h2>
      <p className="text-sm text-slate-300">Create a case and open the deep director workspace.</p>

      <form action={createDirectorCaseAction} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-2 block font-medium">Case title</span>
          <input
            name="title"
            required
            placeholder="e.g. Beverly Hills Mixed-Use Retrofit"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400">
            Create and Open Workspace
          </button>
          <Link className="text-sm text-cyan-300 underline" href="/director/cases">
            Back to Cases Inbox
          </Link>
        </div>
      </form>
    </main>
  );
}
