import type { PerformanceRecord } from "@/lib/contentOps/types";

export type DuplicateRisk = {
  post_id: string;
  titleRisk: number;
  hookRisk: number;
  expressionRisk: number;
  structureRisk: number;
  totalRisk: number;
  blockedFromRecommendation: boolean;
  replacementDirection: string;
};

function tokenize(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1),
  );
}

function jaccard(a: string, b: string) {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  ta.forEach((token) => {
    if (tb.has(token)) intersection += 1;
  });
  const union = ta.size + tb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function detectDuplicationRisk(records: PerformanceRecord[]) {
  const recent = records.slice(-20);

  const risks = recent.map((record, idx) => {
    const others = recent.filter((_, index) => index !== idx);

    const titleRisk = Math.max(0, ...others.map((other) => jaccard(record.title, other.title)));
    const hookRisk = Math.max(0, ...others.map((other) => jaccard(record.hook, other.hook)));
    const expressionRisk = Math.max(0, ...others.map((other) => jaccard(record.script_expression, other.script_expression)));
    const structureRisk = Math.max(
      0,
      ...others.map((other) => (record.structure_signature === other.structure_signature ? 1 : jaccard(record.structure_signature, other.structure_signature))),
    );

    const totalRisk = titleRisk * 0.25 + hookRisk * 0.3 + expressionRisk * 0.25 + structureRisk * 0.2;

    return {
      post_id: record.post_id,
      titleRisk,
      hookRisk,
      expressionRisk,
      structureRisk,
      totalRisk,
      blockedFromRecommendation: totalRisk >= 0.68,
      replacementDirection:
        structureRisk > 0.8
          ? "Switch to a different narrative structure (e.g. FAQ -> case timeline)."
          : hookRisk > 0.7
            ? "Replace opening with symptom-first or cost-risk-first variant."
            : "Keep topic but add localized evidence and different CTA intent.",
    } satisfies DuplicateRisk;
  });

  const blocked = risks.filter((item) => item.blockedFromRecommendation).map((item) => item.post_id);
  const highestRisk = [...risks].sort((a, b) => b.totalRisk - a.totalRisk)[0] ?? null;

  return {
    windowSize: recent.length,
    risks,
    blocked,
    highestRisk,
  };
}
