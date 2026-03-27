import { scriptSamples } from "@/data/contentOps/scriptSamples";
import type { ScriptPack, Topic } from "@/lib/contentOps/types";

export function generateScriptPack(topic: Topic): ScriptPack {
  const sample = scriptSamples.find((item) => item.topic_id === topic.id);
  if (sample) {
    return {
      ...sample,
      ai_smell_risk: Math.max(sample.ai_smell_risk, topic.ai_smell_risk),
      exaggeration_risk: Math.max(sample.exaggeration_risk, topic.exaggeration_risk),
      rewrite_required: sample.ai_smell_risk > 35 || sample.exaggeration_risk > 35,
    };
  }

  const hooks = [
    `If your home has ${topic.title.toLowerCase()}, start here before guessing.`,
    `Most homeowners see this symptom too late: ${topic.title}.`,
    `Real field note from KCW: ${topic.title}.`,
  ];

  return {
    id: `generated_${topic.id}`,
    topic_id: topic.id,
    hook_variants: hooks,
    main_script: `Hook -> symptom -> likely cause -> safe first action -> when to call pro for ${topic.title}.`,
    short_script: "15-25s version with one actionable step.",
    standard_script: "25-45s version with cause and boundary.",
    long_script: "45-60s version with nuance and scenario branch.",
    on_screen_text: ["Symptom", "Cause", "Safe action", "Next step"],
    voiceover: "Keep tone calm, practical, and local. Avoid dramatic words.",
    subtitle_copy: "真实施工语气，短句，避免空话。",
    caption: `${topic.title} — educational guidance from field experience.`,
    hashtags: ["#plumbing", "#homeowner", "#kcw", "#localservice"],
    CTA: "If you’re in our service area, DM symptom + short video for next-step guidance.",
    pinned_comment: "Drop your symptom details (where/when/how often) and we’ll suggest what to check first.",
    reply_seed: ["Is this single fixture or multiple fixtures?", "Any leak, smell, or safety concern?", "Can you share home age roughly?"],
    realism_notes: "Use only verified field details. Label as educational when not tied to a confirmed case.",
    human_tone_notes: "Blue-collar professional, no slogan language.",
    ai_smell_risk: topic.ai_smell_risk,
    exaggeration_risk: topic.exaggeration_risk,
    trustworthiness_score: topic.trust_score,
    rewrite_required: topic.ai_smell_risk > 35 || topic.exaggeration_risk > 35,
    notes: "No fake quotes, no absolute claims, no fear CTA.",
    review_status: "draft",
    reviewer_notes: "待审核，人工确认后才可进入发布排期。",
    version_history: [
      {
        version_id: `generated_${topic.id}_v1`,
        created_at: new Date().toISOString(),
        updated_by: "script_generator",
        status: "draft",
        notes: "自动生成初稿。",
        summary: "等待人工 review / approval。",
      },
    ],
  };
}
