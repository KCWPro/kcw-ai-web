import { NextResponse } from "next/server";
import { createDirectorCase, listDirectorCases } from "@/lib/director/casesStore";

export async function GET() {
  const cases = await listDirectorCases();
  return NextResponse.json({ cases });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const title = typeof payload?.title === "string" ? payload.title : "";
  const summary = typeof payload?.summary === "string" ? payload.summary : "";

  if (!title.trim()) {
    return NextResponse.json({ error: "Case title is required." }, { status: 400 });
  }

  const created = await createDirectorCase({ title, summary });

  return NextResponse.json({
    case: {
      ...created,
      case_id: created.id,
    },
  });
}
