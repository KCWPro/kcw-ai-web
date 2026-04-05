import { DIRECTOR_STATUSES, type DirectorCaseStatus } from "@/lib/director/types";

export const directorStatusLabels: Record<DirectorCaseStatus, string> = {
  draft: "Draft",
  intake_ready: "Intake Ready",
  ai_analysis_ready: "AI Analysis Ready",
  engineering_review_ready: "Engineering Review Ready",
  estimate_ready: "Estimate Ready",
  contract_ready: "Contract Ready",
  permit_review_pending: "Permit Review Pending",
  procurement_review_pending: "Procurement Review Pending",
  site_visit_needed: "Site Visit Needed",
  completed: "Completed",
  archived: "Archived",
};

const transitions: Record<DirectorCaseStatus, DirectorCaseStatus[]> = {
  draft: ["intake_ready", "archived"],
  intake_ready: ["ai_analysis_ready", "draft", "archived"],
  ai_analysis_ready: ["engineering_review_ready", "site_visit_needed", "archived"],
  engineering_review_ready: ["estimate_ready", "site_visit_needed", "archived"],
  estimate_ready: ["contract_ready", "permit_review_pending", "procurement_review_pending", "archived"],
  contract_ready: ["permit_review_pending", "procurement_review_pending", "completed", "archived"],
  permit_review_pending: ["procurement_review_pending", "completed", "archived"],
  procurement_review_pending: ["completed", "archived"],
  site_visit_needed: ["engineering_review_ready", "estimate_ready", "archived"],
  completed: ["archived"],
  archived: [],
};

export function getDirectorAllowedTransitions(status: DirectorCaseStatus): DirectorCaseStatus[] {
  return transitions[status];
}

export function isDirectorStatus(candidate: string): candidate is DirectorCaseStatus {
  return (DIRECTOR_STATUSES as readonly string[]).includes(candidate);
}

export function canTransitionDirectorStatus(from: DirectorCaseStatus, to: DirectorCaseStatus): boolean {
  return transitions[from].includes(to);
}
