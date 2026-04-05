import Link from "next/link";

const mockCases = [
  { id: "case-001", title: "Logo refresh - ACME Dental" },
  { id: "case-002", title: "PPC turnaround - Northbridge Legal" },
];

export default function DirectorCasesPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-2xl font-semibold text-slate-900">Cases</h1>
      <ul className="grid gap-3">
        {mockCases.map((item) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">{item.title}</p>
            <Link className="text-sm text-blue-600 hover:underline" href={`/director/cases/${item.id}`}>
              Open case
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
