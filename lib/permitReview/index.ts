import type { LeadMasterRecord, PermitReviewRecord } from "@/lib/directorConsole/types";

export function buildPermitReviewRecord(lead: LeadMasterRecord): PermitReviewRecord {
  return lead.permit_review;
}
