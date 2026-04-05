import { NextResponse } from "next/server";
import { runDirectorAiAnalysis } from "@/lib/director/store";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updated = runDirectorAiAnalysis(id);
  if (!updated) {
    return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, case: updated.case_record });
}
