export const directorLeadStatuses = [
  "new",
  "media_pending_review",
  "diagnosis_in_progress",
  "engineering_review_pending",
  "estimate_pending",
  "contract_pending",
  "permit_review_pending",
  "follow_up_pending",
  "site_visit_recommended",
  "senior_review_required",
  "closed_won",
  "closed_lost",
  "archived",
] as const;

export type DirectorLeadStatus = (typeof directorLeadStatuses)[number];

export const directorLeadStatusLabels: Record<DirectorLeadStatus, string> = {
  new: "New",
  media_pending_review: "Media Pending Review",
  diagnosis_in_progress: "Diagnosis In Progress",
  engineering_review_pending: "Engineering Review Pending",
  estimate_pending: "Estimate Pending",
  contract_pending: "Contract Pending",
  permit_review_pending: "Permit Review Pending",
  follow_up_pending: "Follow-up Pending",
  site_visit_recommended: "Site Visit Recommended",
  senior_review_required: "Senior Review Required",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
  archived: "Archived",
};

export const adminWorkflowActions = [
  { key: "media_pending_review", label: "标记待补拍" },
  { key: "engineering_review_pending", label: "标记待工程判断" },
  { key: "estimate_pending", label: "标记待报价" },
  { key: "contract_pending", label: "标记待合同" },
  { key: "site_visit_recommended", label: "标记待上门" },
  { key: "permit_review_pending", label: "标记待 permit 核实" },
  { key: "follow_up_pending", label: "标记待跟进" },
  { key: "senior_review_required", label: "标记待 senior review" },
  { key: "closed_won", label: "标记成交" },
  { key: "closed_lost", label: "标记流失" },
  { key: "archived", label: "归档" },
] as const;

export const directorStatusTransitions: Partial<Record<DirectorLeadStatus, DirectorLeadStatus[]>> = {
  new: ["media_pending_review", "diagnosis_in_progress", "follow_up_pending", "closed_lost"],
  media_pending_review: ["diagnosis_in_progress", "follow_up_pending", "closed_lost"],
  diagnosis_in_progress: ["engineering_review_pending", "site_visit_recommended", "senior_review_required"],
  engineering_review_pending: ["estimate_pending", "site_visit_recommended", "senior_review_required"],
  estimate_pending: ["contract_pending", "follow_up_pending", "senior_review_required"],
  contract_pending: ["permit_review_pending", "follow_up_pending", "closed_won"],
  permit_review_pending: ["follow_up_pending", "closed_won", "senior_review_required"],
  follow_up_pending: ["estimate_pending", "contract_pending", "closed_won", "closed_lost"],
  site_visit_recommended: ["engineering_review_pending", "estimate_pending", "senior_review_required"],
  senior_review_required: ["engineering_review_pending", "estimate_pending", "contract_pending"],
  closed_won: ["archived"],
  closed_lost: ["archived"],
};

export function canTransitionStatus(from: DirectorLeadStatus, to: DirectorLeadStatus): boolean {
  if (from === to) return true;
  return directorStatusTransitions[from]?.includes(to) ?? false;
}
