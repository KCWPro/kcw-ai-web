import Link from "next/link";

const nav = [
  { href: "/director", label: "Dashboard" },
  { href: "/director/cases", label: "Cases Inbox" },
  { href: "/director/cases/new", label: "New Case" },
  { href: "/director/contracts", label: "Contract Center" },
  { href: "/director/permits", label: "Permit Center" },
  { href: "/director/procurement", label: "Procurement Center" },
];

export default function DirectorShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">KCW AI</p>
            <h1 className="text-lg font-semibold">Director Console v1</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md border border-slate-700 px-3 py-1 hover:bg-slate-800">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">{children}</main>
    </div>
  );
}
