import { NextResponse } from "next/server";
import { importDirectorCaseFromLead } from "@/lib/director/store";

export async function POST(_request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await context.params;
  const created = importDirectorCaseFromLead(leadId);
  if (!created) {
    return NextResponse.json({ success: false, error: "Lead not found for import" }, { status: 404 });
  }
  return NextResponse.json({ success: true, case: created.case_record });
}
