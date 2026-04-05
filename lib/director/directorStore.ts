import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type DirectorCase = {
  id: string;
  title: string;
  engineering: string;
  materials: string;
  estimate: string;
  contract: string;
  permit: string;
  procurement: string;
  createdAt: string;
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "director-cases.json");

function ensureStoreFile() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, "[]", "utf8");
  }
}

function readCases(): DirectorCase[] {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DirectorCase[]) : [];
  } catch {
    return [];
  }
}

function writeCases(cases: DirectorCase[]) {
  ensureStoreFile();
  fs.writeFileSync(STORE_PATH, JSON.stringify(cases, null, 2), "utf8");
}

function defaultSectionValue(label: string, title: string) {
  return `${label} plan initialized for ${title}`;
}

export function createDirectorCase(input: { title: string }): DirectorCase {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Case title is required");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const created: DirectorCase = {
    id,
    title,
    engineering: defaultSectionValue("Engineering", title),
    materials: defaultSectionValue("Materials", title),
    estimate: defaultSectionValue("Estimate", title),
    contract: defaultSectionValue("Contract", title),
    permit: defaultSectionValue("Permit", title),
    procurement: defaultSectionValue("Procurement", title),
    createdAt: now,
  };

  const existing = readCases();
  existing.unshift(created);
  writeCases(existing);
  return created;
}

export function listDirectorCases(): DirectorCase[] {
  return readCases();
}

export function getDirectorCaseById(id: string): DirectorCase | null {
  return readCases().find((item) => item.id === id) ?? null;
}
