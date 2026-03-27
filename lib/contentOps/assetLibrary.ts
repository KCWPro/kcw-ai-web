import type { AssetRecord } from "@/lib/contentOps/types";

export type AssetBinding = {
  asset_id: string;
  topic_id?: string;
  script_id?: string;
  post_plan_id?: string;
};

export const seedAssets: AssetRecord[] = [
  {
    asset_id: "asset_01",
    filename: "kitchen_sink_before_after.mp4",
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
  },
  {
    asset_id: "asset_02",
    filename: "technician_voice_note.m4a",
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
  },
  {
    asset_id: "asset_03",
    filename: "water_heater_valve_broll.mov",
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
  },
];

export type AssetFilter = {
  serviceType?: string;
  tags?: string[];
  safeForPublic?: boolean;
  beforeAfter?: boolean;
  bRoll?: boolean;
};

export function filterAssets(records: AssetRecord[], filter: AssetFilter) {
  return records.filter((asset) => {
    if (filter.serviceType && asset.service_type !== filter.serviceType) return false;
    if (typeof filter.safeForPublic === "boolean" && asset.safe_for_public !== filter.safeForPublic) return false;
    if (filter.beforeAfter && !asset.tags.includes("before-after")) return false;
    if (filter.bRoll && !asset.tags.map((tag) => tag.toLowerCase()).includes("b-roll")) return false;
    if (filter.tags && filter.tags.length > 0 && !filter.tags.every((tag) => asset.tags.includes(tag))) return false;
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
