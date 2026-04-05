import Link from "next/link";
import { getDirectorCaseById } from "@/lib/director/casesStore";

interface WorkspacePageProps {
  params: Promise<{ id: string }>;
}

export default async function DirectorCaseWorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params;
  const currentCase = await getDirectorCaseById(id);

  if (!currentCase) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Case not found</h1>
        <p>The requested case does not exist or is unavailable.</p>
        <p>
          <Link href="/director/cases">Back to Cases Inbox</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 20 }}>
        <p>
          <Link href="/director/cases">← Cases Inbox</Link>
        </p>
        <h1>{currentCase.title}</h1>
        <p>
          <strong>Case ID:</strong> {currentCase.id}
        </p>
        <p>
          <strong>Status:</strong> {currentCase.status}
        </p>
      </header>

      <section style={{ marginBottom: 16 }}>
        <h2>Situation Summary</h2>
        <p>{currentCase.summary || "No summary provided."}</p>
      </section>

      <section>
        <h2>Primary Modules</h2>
        <ul>
          <li>Timeline</li>
          <li>Decision log</li>
          <li>Approvals</li>
        </ul>
      </section>
    </main>
  );
}
