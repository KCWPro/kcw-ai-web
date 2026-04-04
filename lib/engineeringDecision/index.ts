import type { EngineeringDecisionRecord, LeadMasterRecord } from "@/lib/directorConsole/types";

export function buildEngineeringDecisionRecord(lead: LeadMasterRecord): EngineeringDecisionRecord {
  return lead.engineering_decision;
}
