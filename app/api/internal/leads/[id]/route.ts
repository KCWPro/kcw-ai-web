import { NextRequest } from "next/server";
import { readInternalLeadByIdFromGoogleSheet } from "@/lib/internalLeadsStore";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const lead = await readInternalLeadByIdFromGoogleSheet(id);
    if (!lead) {
      return Response.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    return Response.json({ success: true, lead });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to read lead";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH() {
  return Response.json(
    {
      success: false,
      error:
        "Internal lead detail writes are disabled in Beta preview. This endpoint is read-only during controlled testing.",
    },
    { status: 403 },
  );
}
