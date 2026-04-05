import Link from "next/link";
import type { ReactNode } from "react";

const directorNav = [
  { href: "/director", label: "Console" },
  { href: "/director/cases", label: "Cases" },
  { href: "/director/contracts", label: "Contracts" },
  { href: "/director/permits", label: "Permits" },
  { href: "/director/procurement", label: "Procurement" },
];

export default function DirectorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-cyan-500/30 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">KCW AI Director Console v1</p>
            <h1 className="text-lg font-semibold text-white">Independent Director Operating Surface</h1>
            <p className="text-sm text-slate-300">
              Dedicated command layer for executive case steering, contracting, permit planning, and procurement control.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {directorNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-cyan-400/30 bg-slate-800 px-3 py-1.5 text-sm font-medium text-cyan-100 hover:border-cyan-300 hover:bg-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
