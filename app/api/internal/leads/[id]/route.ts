import { NextRequest } from "next/server";
import { readInternalLeadByIdFromGoogleSheet, updateInternalLeadInGoogleSheet } from "@/lib/internalLeadsStore";
import { LeadStatus } from "@/lib/internalLeads";

const allowedStatus: LeadStatus[] = ["new", "follow_up", "quoted", "scheduled", "completed", "archived"];

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = (await req.json()) as { status?: string; internal_notes?: string };
    const updates: { status?: LeadStatus; internal_notes?: string; last_updated_at?: string } = {};

    if (typeof body.status === "string") {
      if (!allowedStatus.includes(body.status as LeadStatus)) {
        return Response.json({ success: false, error: "Invalid status value" }, { status: 400 });
      }
      updates.status = body.status as LeadStatus;
    }

    if (typeof body.internal_notes === "string") {
      updates.internal_notes = body.internal_notes;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ success: false, error: "No updates provided" }, { status: 400 });
    }

    updates.last_updated_at = new Date().toISOString();
    const lead = await updateInternalLeadInGoogleSheet(id, updates);

    return Response.json({ success: true, lead });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update lead";
    const status = message.includes("not found") ? 404 : 500;
    return Response.json({ success: false, error: message }, { status });
  }
}
