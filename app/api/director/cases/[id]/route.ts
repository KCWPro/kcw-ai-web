import { NextResponse } from "next/server";
import { isDirectorStatus } from "@/lib/director/statusMachine";
import { getDirectorCaseById, updateDirectorCaseStatus } from "@/lib/director/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = getDirectorCaseById(id);
  if (!bundle) {
    return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, case: bundle });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  if (!isDirectorStatus(body.target_status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }
  const updated = updateDirectorCaseStatus(id, body.target_status);
  if (!updated) {
    return NextResponse.json({ success: false, error: "Transition denied or case missing" }, { status: 400 });
  }
  return NextResponse.json({ success: true, case: updated.case_record });
}
