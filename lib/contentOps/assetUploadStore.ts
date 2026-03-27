import { createAssetFromUpload, seedAssets, type AssetUploadInput, type AssetBinding } from "@/lib/contentOps/assetLibrary";
import type { AssetRecord } from "@/lib/contentOps/types";

type AssetStoreState = {
  uploadedAssets: AssetRecord[];
  bindings: AssetBinding[];
};

const state: AssetStoreState = {
  uploadedAssets: [],
  bindings: [],
};

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

  return created;
}

export function updateAssetMeta(assetId: string, patch: { tags?: string[]; safe_for_public?: boolean }) {
  const target = state.uploadedAssets.find((item) => item.asset_id === assetId);
  if (!target) return null;

  if (patch.tags) {
    target.tags = patch.tags.map((item) => item.trim()).filter(Boolean);
  }
  if (typeof patch.safe_for_public === "boolean") {
    target.safe_for_public = patch.safe_for_public;
  }
  return target;
}

export function listAssetBindings() {
  return state.bindings;
}
