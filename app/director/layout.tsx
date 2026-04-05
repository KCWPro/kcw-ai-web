import Link from "next/link";

const navItems = [
  { href: "/director", label: "Console" },
  { href: "/director/cases", label: "Cases" },
  { href: "/director/contracts", label: "Contracts" },
  { href: "/director/permits", label: "Permits" },
  { href: "/director/procurement", label: "Procurement" },
  { href: "/director/cases/create", label: "Create Director Case" },
];

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <h1 className="text-3xl font-semibold">Director Console</h1>
          <p className="mt-2 text-sm text-slate-300">Operational hub for leadership workflows</p>
          <nav aria-label="Director navigation" className="mt-4 flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 hover:border-cyan-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
