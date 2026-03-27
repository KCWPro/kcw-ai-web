import "server-only";
import fs from "node:fs";
import path from "node:path";
import { scriptSamples } from "@/data/contentOps/scriptSamples";
import { seedPostPlans } from "@/lib/contentOps/operationsExecution";
import type { DuplicationSettings, InteractionThread, MonetizationExecutionLabel, PostPlan, ScriptPack } from "@/lib/contentOps/types";

export type ExecutionTask = {
  task_id: string;
  post_plan_id: string;
  date: string;
  status: "planned" | "filmed" | "edited" | "posted" | "reviewed";
  comments_replied: boolean;
  dms_handled: boolean;
  hot_lead_escalated: boolean;
  checked_in: boolean;
};

export type ContentOpsRuntimeState = {
  scripts: ScriptPack[];
  postPlans: PostPlan[];
  executionTasks: ExecutionTask[];
  interactions: InteractionThread[];
  duplicationSettings: DuplicationSettings;
  monetizationOverrides: Record<string, MonetizationExecutionLabel>;
  importMeta: {
    currentSource: "csv" | "sheet" | "default_seed";
    lastImportedAt: string;
    cycleQualified: boolean;
  };
  sheetConfig: {
    sheet_id: string;
    range: string;
  };
};

const RUNTIME_DIR = path.join(process.cwd(), "data", "contentOps", "runtime");
const STORE_PATH = path.join(RUNTIME_DIR, "content-ops-store.json");

function buildInitialState(): ContentOpsRuntimeState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    scripts: scriptSamples,
    postPlans: seedPostPlans,
    executionTasks: seedPostPlans.map((plan) => ({
      task_id: `task_${plan.id}`,
      post_plan_id: plan.id,
      date: plan.planned_date || today,
      status: plan.status === "published" ? "posted" : plan.status === "editing" ? "edited" : plan.status === "filming" ? "filmed" : "planned",
      comments_replied: plan.review_status !== "draft",
      dms_handled: plan.review_status === "reviewed" || plan.review_status === "approved",
      hot_lead_escalated: plan.review_status === "approved",
      checked_in: false,
    })),
    interactions: [
      {
        id: "thread_comment_01",
        channel: "comment",
        related_post_id: "seed_001",
        content_type: "real_case",
        status: "open",
        intent_level: "medium",
        urgency_level: "low",
        suggested_next_step: "Reply with symptom triage and route to DM.",
        risk_flag: false,
        handoff_to_human: false,
        last_message: "How much does this usually cost?",
        updated_at: new Date().toISOString(),
      },
      {
        id: "thread_dm_01",
        channel: "dm",
        related_post_id: "seed_005",
        content_type: "faq",
        inquiry_type: "quote_consult",
        status: "waiting",
        intent_level: "high",
        urgency_level: "medium",
        suggested_next_step: "Collect city + timeline + symptom video.",
        risk_flag: false,
        handoff_to_human: true,
        last_message: "Can someone call me this afternoon?",
        updated_at: new Date().toISOString(),
      },
      {
        id: "thread_lead_01",
        channel: "lead",
        related_post_id: "seed_008",
        content_type: "maintenance",
        inquiry_type: "emergency",
        status: "escalated",
        intent_level: "high",
        urgency_level: "high",
        suggested_next_step: "Immediate human handoff for safety-first response.",
        risk_flag: true,
        handoff_to_human: true,
        last_message: "There is a gas smell near heater.",
        updated_at: new Date().toISOString(),
      },
    ],
    duplicationSettings: {
      threshold: 0.68,
      groupByPlatform: true,
      groupByLanguage: true,
    },
    monetizationOverrides: {},
    importMeta: {
      currentSource: "default_seed",
      lastImportedAt: new Date().toISOString(),
      cycleQualified: false,
    },
    sheetConfig: {
      sheet_id: "",
      range: "A1:Z",
    },
  };
}

function ensureRuntimeStore() {
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(buildInitialState(), null, 2), "utf-8");
  }
}

function safeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizeState(input: unknown): ContentOpsRuntimeState {
  const fallback = buildInitialState();
  const root = safeObject(input);
  const scripts = Array.isArray(root.scripts) ? root.scripts.filter((item) => item && typeof item === "object") as ScriptPack[] : fallback.scripts;
  const postPlans = Array.isArray(root.postPlans) ? root.postPlans.filter((item) => item && typeof item === "object") as PostPlan[] : fallback.postPlans;
  const executionTasks = Array.isArray(root.executionTasks)
    ? root.executionTasks.filter((item) => item && typeof item === "object") as ExecutionTask[]
    : fallback.executionTasks;
  const interactions = Array.isArray(root.interactions)
    ? root.interactions.filter((item) => item && typeof item === "object") as InteractionThread[]
    : fallback.interactions;
  const duplicationSettings = { ...fallback.duplicationSettings, ...safeObject(root.duplicationSettings) } as DuplicationSettings;
  const monetizationOverrides = safeObject(root.monetizationOverrides) as Record<string, MonetizationExecutionLabel>;
  const importMetaRaw = safeObject(root.importMeta);
  const sheetConfigRaw = safeObject(root.sheetConfig);

  return {
    scripts: scripts.length > 0 ? scripts : fallback.scripts,
    postPlans: postPlans.length > 0 ? postPlans : fallback.postPlans,
    executionTasks,
    interactions,
    duplicationSettings,
    monetizationOverrides,
    importMeta: {
      currentSource:
        importMetaRaw.currentSource === "csv" || importMetaRaw.currentSource === "sheet" || importMetaRaw.currentSource === "default_seed"
          ? importMetaRaw.currentSource
          : fallback.importMeta.currentSource,
      lastImportedAt: typeof importMetaRaw.lastImportedAt === "string" && importMetaRaw.lastImportedAt.trim() ? importMetaRaw.lastImportedAt : fallback.importMeta.lastImportedAt,
      cycleQualified: typeof importMetaRaw.cycleQualified === "boolean" ? importMetaRaw.cycleQualified : fallback.importMeta.cycleQualified,
    },
    sheetConfig: {
      sheet_id: typeof sheetConfigRaw.sheet_id === "string" ? sheetConfigRaw.sheet_id : fallback.sheetConfig.sheet_id,
      range: typeof sheetConfigRaw.range === "string" && sheetConfigRaw.range.trim() ? sheetConfigRaw.range : fallback.sheetConfig.range,
    },
  };
}

export function readContentOpsState(): ContentOpsRuntimeState {
  ensureRuntimeStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    if (!raw.trim()) {
      const fallback = buildInitialState();
      fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const normalized = normalizeState(JSON.parse(raw));
    fs.writeFileSync(STORE_PATH, JSON.stringify(normalized, null, 2), "utf-8");
    return normalized;
  } catch {
    const fallback = buildInitialState();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

export function writeContentOpsState(mutator: (state: ContentOpsRuntimeState) => ContentOpsRuntimeState) {
  const next = mutator(readContentOpsState());
  fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
