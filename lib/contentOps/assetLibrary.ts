import type { AssetRecord } from "@/lib/contentOps/types";

export type AssetBinding = {
  asset_id: string;
  topic_id?: string;
  script_id?: string;
  post_plan_id?: string;
};

export type AssetUploadInput = {
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  preview_url: string;
  project?: string;
  service_type?: string;
  tags?: string[];
  safe_for_public?: boolean;
  notes?: string;
  talking_head_compatible?: boolean;
  topic_id?: string;
  script_id?: string;
  post_plan_id?: string;
};

export const seedAssets: AssetRecord[] = [
  {
    asset_id: "asset_01",
    filename: "kitchen_sink_before_after.mp4",
    mime_type: "video/mp4",
    file_size_bytes: 5242880,
    uploaded_at: "2026-03-12T09:12:00.000Z",
    preview_url: "/internal/content-ops/previews/asset_01",
    project: "Austin Riverside",
    service_type: "drain_cleaning",
    tags: ["before-after", "kitchen", "odor"],
    project_date: "2026-03-12",
    people_visible: false,
    customer_sensitive: false,
    safe_for_public: true,
    language_fit: ["en", "zh"],
    best_platform: ["tiktok", "instagram_reels"],
    can_reuse: true,
    quality_score: 88,
    reuse_score: 90,
    notes: "Good natural lighting",
    talking_head_compatible: false,
  },
  {
    asset_id: "asset_02",
    filename: "technician_voice_note.m4a",
    mime_type: "audio/mp4",
    file_size_bytes: 1835008,
    uploaded_at: "2026-03-18T16:08:00.000Z",
    preview_url: "/internal/content-ops/previews/asset_02",
    project: "Georgetown",
    service_type: "inspection",
    tags: ["voiceover", "B-roll"],
    project_date: "2026-03-18",
    people_visible: true,
    customer_sensitive: true,
    safe_for_public: false,
    language_fit: ["en"],
    best_platform: ["youtube_shorts"],
    can_reuse: false,
    quality_score: 61,
    reuse_score: 35,
    notes: "Needs redaction before reuse",
    talking_head_compatible: true,
  },
  {
    asset_id: "asset_03",
    filename: "water_heater_valve_broll.mov",
    mime_type: "video/quicktime",
    file_size_bytes: 7864320,
    uploaded_at: "2026-03-20T11:21:00.000Z",
    preview_url: "/internal/content-ops/previews/asset_03",
    project: "Round Rock",
    service_type: "water_heater",
    tags: ["B-roll", "safety", "closeup"],
    project_date: "2026-03-20",
    people_visible: false,
    customer_sensitive: false,
    safe_for_public: true,
    language_fit: ["en", "en_audio_zh_sub"],
    best_platform: ["tiktok", "youtube_shorts"],
    can_reuse: true,
    quality_score: 82,
    reuse_score: 86,
    notes: "Great for quick safety hooks",
    talking_head_compatible: true,
  },
];

export function createAssetFromUpload(input: AssetUploadInput): AssetRecord {
  const now = new Date().toISOString();
  const normalizedTags = (input.tags ?? [])
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return {
    asset_id: `asset_${now.replace(/[^0-9]/g, "").slice(-10)}`,
    filename: input.filename,
    mime_type: input.mime_type,
    file_size_bytes: input.file_size_bytes,
    uploaded_at: now,
    preview_url: input.preview_url,
    project: input.project ?? "Unassigned",
    service_type: input.service_type ?? "general",
    tags: normalizedTags,
    project_date: now.slice(0, 10),
    people_visible: false,
    customer_sensitive: false,
    safe_for_public: input.safe_for_public ?? false,
    language_fit: ["en"],
    best_platform: ["tiktok", "instagram_reels"],
    can_reuse: true,
    quality_score: 70,
    reuse_score: 70,
    notes: "Uploaded via lightweight Asset API.",
    talking_head_compatible: input.talking_head_compatible ?? false,
  };
}

export type AssetFilter = {
  serviceType?: string;
  tags?: string[];
  safeForPublic?: boolean;
  beforeAfter?: boolean;
  bRoll?: boolean;
  talkingHeadCompatible?: boolean;
};

export function filterAssets(records: AssetRecord[], filter: AssetFilter) {
  return records.filter((asset) => {
    if (filter.serviceType && asset.service_type !== filter.serviceType) return false;
    if (typeof filter.safeForPublic === "boolean" && asset.safe_for_public !== filter.safeForPublic) return false;
    if (filter.beforeAfter && !asset.tags.includes("before-after")) return false;
    if (filter.bRoll && !asset.tags.map((tag) => tag.toLowerCase()).includes("b-roll")) return false;
    if (filter.talkingHeadCompatible && !asset.talking_head_compatible) return false;
    if (
      filter.tags &&
      filter.tags.length > 0 &&
      !filter.tags.every((tag) => asset.tags.map((item) => item.toLowerCase()).includes(tag.toLowerCase()))
    )
      return false;
    return true;
  });
}

export function findAssetGaps(records: AssetRecord[]) {
  const missing: string[] = [];
  if (!records.some((item) => item.tags.includes("before-after") && item.safe_for_public)) {
    missing.push("Missing safe-for-public before/after proof clips.");
  }
  if (!records.some((item) => item.tags.map((tag) => tag.toLowerCase()).includes("b-roll"))) {
    missing.push("Missing reusable B-roll footage for maintenance explainers.");
  }
  if (!records.some((item) => item.service_type === "water_heater")) {
    missing.push("Missing water heater asset set for high-conversion FAQ.");
  }
  return missing;
}
