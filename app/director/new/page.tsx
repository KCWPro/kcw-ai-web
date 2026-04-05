"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getDirectorCaseWorkspacePath, normalizeCreatedDirectorCase } from "@/lib/director/caseContract";

export default function CreateDirectorCasePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/director/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : "Failed to create case.");
      }

      const created = normalizeCreatedDirectorCase(body?.case);
      router.push(getDirectorCaseWorkspacePath(created.id));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create case.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Create Director Case</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Case Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Supplier delay escalation"
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Summary
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Key stakeholders, blockers, and required approval."
            rows={5}
          />
        </label>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create case"}
        </button>
      </form>
    </main>
  );
}
