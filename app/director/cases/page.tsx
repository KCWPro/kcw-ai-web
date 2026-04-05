import Link from "next/link";
import { listDirectorCases } from "@/lib/director/directorStore";

export default function DirectorCasesInboxPage() {
  const cases = listDirectorCases();

  return (
    <main className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Cases Inbox</h2>
        <Link href="/director/cases/create" className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950">
          Create Director Case
        </Link>
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-slate-300">No cases yet.</p>
      ) : (
        <ul className="space-y-2">
          {cases.map((item) => (
            <li key={item.id} className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
              <Link href={`/director/cases/${item.id}`} className="font-medium text-cyan-300 underline">
                {item.title}
              </Link>
              <p className="mt-1 text-xs text-slate-400">{item.id}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
