import { createAssetFromUpload, seedAssets, type AssetUploadInput, type AssetBinding } from "@/lib/contentOps/assetLibrary";
import type { AssetRecord } from "@/lib/contentOps/types";
import fs from "node:fs";
import path from "node:path";

type AssetStoreState = {
  uploadedAssets: AssetRecord[];
  bindings: AssetBinding[];
};

const state: AssetStoreState = {
  uploadedAssets: [],
  bindings: [],
};

const RUNTIME_DIR = path.join(process.cwd(), "data", "contentOps", "runtime");
const STORE_PATH = path.join(RUNTIME_DIR, "asset-upload-store.json");

function hydrateState() {
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
    return;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as AssetStoreState;
    state.uploadedAssets = parsed.uploadedAssets ?? [];
    state.bindings = parsed.bindings ?? [];
  } catch {
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
  }
}

function persistState() {
  if (!fs.existsSync(RUNTIME_DIR)) fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

hydrateState();

export function listAssetsWithUploads() {
  return [...state.uploadedAssets, ...seedAssets];
}

export function getUploadedAssets() {
  return state.uploadedAssets;
}

export function uploadAsset(input: AssetUploadInput) {
  const created = createAssetFromUpload(input);
  state.uploadedAssets.unshift(created);

  if (input.topic_id || input.script_id || input.post_plan_id) {
    state.bindings.unshift({
      asset_id: created.asset_id,
      topic_id: input.topic_id,
      script_id: input.script_id,
      post_plan_id: input.post_plan_id,
    });
  }

  persistState();
  return created;
}

export function updateAssetMeta(assetId: string, patch: { tags?: string[]; safe_for_public?: boolean; notes?: string; service_type?: string }) {
  const target = state.uploadedAssets.find((item) => item.asset_id === assetId);
  if (!target) return null;

  if (patch.tags) {
    target.tags = patch.tags.map((item) => item.trim()).filter(Boolean);
  }
  if (typeof patch.safe_for_public === "boolean") {
    target.safe_for_public = patch.safe_for_public;
  }
  if (typeof patch.notes === "string") {
    target.notes = patch.notes;
  }
  if (typeof patch.service_type === "string" && patch.service_type.trim()) {
    target.service_type = patch.service_type.trim();
  }
  persistState();
  return target;
}

export function listAssetBindings() {
  return state.bindings;
}
