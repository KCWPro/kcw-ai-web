import type { DirectorCase } from "./casesStore";

interface UnknownCasePayload {
  id?: unknown;
  case_id?: unknown;
  title?: unknown;
  summary?: unknown;
  status?: unknown;
  createdAt?: unknown;
}

export function normalizeCreatedDirectorCase(payload: unknown): DirectorCase {
  const candidate = (payload ?? {}) as UnknownCasePayload;
  const id = typeof candidate.id === "string" ? candidate.id : typeof candidate.case_id === "string" ? candidate.case_id : "";

  if (!id) {
    throw new Error("Create case response missing id.");
  }

  return {
    id,
    title: typeof candidate.title === "string" ? candidate.title : "Untitled case",
    summary: typeof candidate.summary === "string" ? candidate.summary : "",
    status: candidate.status === "in_review" || candidate.status === "closed" ? candidate.status : "new",
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date(0).toISOString(),
  };
}

export function getDirectorCaseWorkspacePath(caseId: string) {
  return `/director/cases/${encodeURIComponent(caseId)}`;
}
