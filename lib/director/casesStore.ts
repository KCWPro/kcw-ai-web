import { promises as fs } from "node:fs";
import path from "node:path";

export type DirectorCaseStatus = "new" | "in_review" | "closed";

export interface DirectorCase {
  id: string;
  title: string;
  summary: string;
  status: DirectorCaseStatus;
  createdAt: string;
}

export interface DirectorCaseInput {
  title: string;
  summary: string;
}

const CASES_FILE_PATH = process.env.DIRECTOR_CASES_FILE_PATH
  ? path.resolve(process.env.DIRECTOR_CASES_FILE_PATH)
  : path.join(process.cwd(), "data", "director", "cases.json");

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(CASES_FILE_PATH), { recursive: true });
  try {
    await fs.access(CASES_FILE_PATH);
  } catch {
    await fs.writeFile(CASES_FILE_PATH, "[]\n", "utf8");
  }
}

async function readCases(): Promise<DirectorCase[]> {
  await ensureStoreFile();
  const raw = await fs.readFile(CASES_FILE_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is DirectorCase => {
    return Boolean(
      item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.summary === "string" &&
        typeof item.status === "string" &&
        typeof item.createdAt === "string",
    );
  });
}

async function writeCases(cases: DirectorCase[]) {
  await ensureStoreFile();
  await fs.writeFile(CASES_FILE_PATH, `${JSON.stringify(cases, null, 2)}\n`, "utf8");
}

function buildDirectorCaseId() {
  return `dcase_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listDirectorCases() {
  const cases = await readCases();
  return [...cases].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDirectorCaseById(id: string) {
  const cases = await readCases();
  return cases.find((item) => item.id === id) ?? null;
}

export async function createDirectorCase(input: DirectorCaseInput) {
  const title = input.title.trim();
  const summary = input.summary.trim();

  if (!title) {
    throw new Error("Case title is required.");
  }

  const nextCase: DirectorCase = {
    id: buildDirectorCaseId(),
    title,
    summary,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  const cases = await readCases();
  cases.push(nextCase);
  await writeCases(cases);
  return nextCase;
}
