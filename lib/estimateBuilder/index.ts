import type { EstimateRecord, LeadMasterRecord } from "@/lib/directorConsole/types";

export function buildEstimateRecord(lead: LeadMasterRecord): EstimateRecord {
  return lead.estimate;
}
