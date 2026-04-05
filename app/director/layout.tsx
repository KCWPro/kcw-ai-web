import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/director", label: "Dashboard" },
  { href: "/director/cases", label: "Cases" },
  { href: "/director/cases/new", label: "New Case" },
  { href: "/director/contracts", label: "Contracts" },
];

export default function DirectorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">KCW Director Console</p>
            <p className="text-sm font-semibold text-slate-900">ops.kcwpro.com/director</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
