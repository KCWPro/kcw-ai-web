import type { PerformanceRecord } from "@/lib/contentOps/types";

export function analyzePerformance(records: PerformanceRecord[]) {
  if (records.length === 0) {
    return {
      high_performer_patterns: [],
      low_performer_patterns: [],
      repeat: [],
      stop: [],
      test: [],
    };
  }

  const high = records.filter((record) => record.views >= 2000 && record.retention >= 0.35);
  const low = records.filter((record) => record.views < 1000 || record.retention < 0.2);

  return {
    high_performer_patterns: [
      ...new Set(high.map((record) => `${record.format_type} + ${record.language}`)),
    ],
    low_performer_patterns: [
      ...new Set(low.map((record) => `${record.format_type} + ${record.language}`)),
    ],
    repeat: ["High retention hook style", "Practical FAQ with clear first-screen problem"],
    stop: ["Repeated weak topics from last 20 posts", "Hard-sell CTA in low retention videos"],
    test: ["B-roll vs talking head split", "EN-only vs EN-audio ZH-sub for same topic"],
  };
}
