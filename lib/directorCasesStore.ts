import fs from 'node:fs';
import path from 'node:path';

export type DirectorCaseStatus = 'draft' | 'active' | 'blocked' | 'closed';

export type DirectorCase = {
  id: string;
  title: string;
  clientName: string;
  address: string;
  scopeSummary: string;
  status: DirectorCaseStatus;
  createdAt: string;
  updatedAt: string;
};

type DirectorCaseStore = {
  cases: DirectorCase[];
};

const RUNTIME_DIR = path.join(process.cwd(), 'data', 'director', 'runtime');
const STORE_PATH = path.join(RUNTIME_DIR, 'director-cases.json');
const FILE_WRITES_ENABLED = process.env.VERCEL !== '1';

let memoryStore: DirectorCaseStore | null = null;

function nowIso() {
  return new Date().toISOString();
}

function createInitialStore(): DirectorCaseStore {
  const createdAt = nowIso();
  return {
    cases: [
      {
        id: 'case_seed_director_001',
        title: 'Rosemead ADU plumbing + permitting',
        clientName: 'Lin Family',
        address: 'Rosemead, CA',
        scopeSummary: 'ADU supply/drain rough-in, permit plan alignment, and procurement coordination.',
        status: 'active',
        createdAt,
        updatedAt: createdAt,
      },
    ],
  };
}

function normalizeStore(input: unknown): DirectorCaseStore {
  if (!input || typeof input !== 'object') return createInitialStore();
  const root = input as Record<string, unknown>;
  const casesRaw = Array.isArray(root.cases) ? root.cases : [];
  const cases = casesRaw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `case_${Math.random().toString(36).slice(2, 10)}`;
      const timestamp = nowIso();
      const status =
        item.status === 'draft' || item.status === 'active' || item.status === 'blocked' || item.status === 'closed'
          ? item.status
          : 'draft';
      return {
        id,
        title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Untitled director case',
        clientName: typeof item.clientName === 'string' ? item.clientName : '',
        address: typeof item.address === 'string' ? item.address : '',
        scopeSummary: typeof item.scopeSummary === 'string' ? item.scopeSummary : '',
        status,
        createdAt: typeof item.createdAt === 'string' && item.createdAt.trim() ? item.createdAt : timestamp,
        updatedAt: typeof item.updatedAt === 'string' && item.updatedAt.trim() ? item.updatedAt : timestamp,
      } satisfies DirectorCase;
    });

  if (!cases.length) {
    return createInitialStore();
  }

  return { cases };
}

function safeWriteStore(store: DirectorCaseStore) {
  if (!FILE_WRITES_ENABLED) return;
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function readStore(): DirectorCaseStore {
  if (!FILE_WRITES_ENABLED) {
    if (!memoryStore) memoryStore = createInitialStore();
    memoryStore = normalizeStore(memoryStore);
    return memoryStore;
  }

  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    safeWriteStore(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const normalized = normalizeStore(raw.trim() ? JSON.parse(raw) : null);
    safeWriteStore(normalized);
    return normalized;
  } catch {
    const fallback = createInitialStore();
    safeWriteStore(fallback);
    return fallback;
  }
}

function writeStore(mutator: (store: DirectorCaseStore) => DirectorCaseStore): DirectorCaseStore {
  const next = normalizeStore(mutator(readStore()));
  if (!FILE_WRITES_ENABLED) {
    memoryStore = next;
    return next;
  }

  safeWriteStore(next);
  return next;
}

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

export function createDirectorCaseId(title: string) {
  const stamp = Date.now().toString(36);
  const segment = slugifySegment(title) || 'director-case';
  return `dc_${stamp}_${segment}`;
}

export function listDirectorCases() {
  return [...readStore().cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getDirectorCaseById(id: string) {
  return readStore().cases.find((item) => item.id === id) ?? null;
}

export function createDirectorCase(input: {
  title: string;
  clientName: string;
  address: string;
  scopeSummary: string;
}) {
  const now = nowIso();
  const created: DirectorCase = {
    id: createDirectorCaseId(input.title),
    title: input.title.trim() || 'Untitled director case',
    clientName: input.clientName.trim(),
    address: input.address.trim(),
    scopeSummary: input.scopeSummary.trim(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  writeStore((store) => ({
    ...store,
    cases: [created, ...store.cases.filter((item) => item.id !== created.id)],
  }));

  return created;
}
