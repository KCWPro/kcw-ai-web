import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/director', label: 'Console' },
  { href: '/director/cases', label: 'Cases' },
  { href: '/director/contracts', label: 'Contracts' },
  { href: '/director/permits', label: 'Permits' },
  { href: '/director/procurement', label: 'Procurement' },
  { href: '/director/cases/create', label: 'Create Director Case' },
];

export function DirectorShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-slate-950/40">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Director Console</p>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
          <nav className="mt-4 flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
