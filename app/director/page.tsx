import Link from "next/link";

const sections = [
  { href: "/director", label: "Console" },
  { href: "/director/cases", label: "Cases" },
  { href: "/director/contracts", label: "Contracts" },
  { href: "/director/permits", label: "Permits" },
  { href: "/director/procurement", label: "Procurement" },
];

export default function DirectorConsoleHome() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Director Console</h1>
      <p>Operational hub for leadership workflows.</p>
      <ul>
        {sections.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/director/new">Create Director Case</Link>
      </p>
    </main>
  );
}
