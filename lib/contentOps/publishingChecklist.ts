import type { ScriptPack, Topic } from "@/lib/contentOps/types";

export type PublishingChecklistResult = {
  pass: boolean;
  items: Array<{ label: string; ok: boolean; note: string }>;
};

export function buildPublishingChecklist(topic: Topic, script: ScriptPack): PublishingChecklistResult {
  const items = [
    { label: "Hook clarity in first 3 seconds", ok: script.hook_variants.length >= 3, note: "Need 3 hooks minimum for A/B test." },
    { label: "Homeowner relevance", ok: topic.audience.toLowerCase().includes("homeowner"), note: "Audience must be explicit homeowner segment." },
    { label: "Not overly promotional", ok: !/best|guarantee|100%|always/i.test(script.caption), note: "Avoid hard-sell or absolute claims." },
    { label: "AI smell risk", ok: script.ai_smell_risk <= 35, note: "If high, rewrite with field phrases and uneven sentence rhythm." },
    { label: "Exaggeration risk", ok: script.exaggeration_risk <= 35, note: "Remove fear tactics and clickbait wording." },
    { label: "Realism coverage", ok: topic.realism_score >= 80, note: "Add real shot list when realism is weak." },
    { label: "CTA softness", ok: !/buy now|act now/i.test(script.CTA), note: "Use consultative CTA to DM/form/phone." },
    { label: "Subtitle density", ok: script.subtitle_copy.length <= 120, note: "Keep subtitle concise for Shorts readability." },
  ];

  return {
    pass: items.every((item) => item.ok),
    items,
  };
}
