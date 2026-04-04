import type { LeadMasterRecord, VisualDiagnosisRecord } from "@/lib/directorConsole/types";

export function buildVisualDiagnosisRecord(lead: LeadMasterRecord): VisualDiagnosisRecord {
  return lead.visual_diagnosis;
}
