import Link from "next/link";
import { listDirectorCases } from "@/lib/director/casesStore";

export default async function DirectorCasesInboxPage() {
  const cases = await listDirectorCases();

  return (
    <main style={{ padding: 24 }}>
      <h1>Director Cases Inbox</h1>
      <p>
        <Link href="/director/new">Create another case</Link>
      </p>
      {cases.length === 0 ? (
        <p>No cases yet.</p>
      ) : (
        <ul>
          {cases.map((item) => (
            <li key={item.id}>
              <Link href={`/director/cases/${item.id}`}>{item.title}</Link> · <strong>{item.status}</strong>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
