import { NextResponse } from "next/server";
import { createDirectorCase, listDirectorCases } from "@/lib/director/store";

export async function GET() {
  return NextResponse.json({ success: true, cases: listDirectorCases().map((item) => item.case_record) });
}

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const created = createDirectorCase(input);
    return NextResponse.json({ success: true, case: created.case_record });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create director case";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
