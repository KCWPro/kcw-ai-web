import { NextRequest } from "next/server";
import { buildIntakeAnalysis } from "@/lib/aiIntakeAnalysis";
import { LeadStatus } from "@/lib/internalLeads";
import {
  readInternalLeadByIdFromGoogleSheet,
  updateInternalLeadInGoogleSheet,
} from "@/lib/internalLeadsStore";

const ALLOWED_INTENTS = ["manual_reanalyze", "status_update", "notes_update"] as const;
type AllowedIntent = (typeof ALLOWED_INTENTS)[number];
const ALLOWED_STATUSES: LeadStatus[] = ["new", "follow_up", "quoted", "scheduled", "completed", "archived"];

function hasMultiObjectPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const record = payload as Record<string, unknown>;
  return (
    Array.isArray(record.ids) ||
    Array.isArray(record.lead_ids) ||
    Array.isArray(record.items) ||
    Array.isArray(record.batch) ||
    typeof record.target_id === "string" ||
    typeof record.targetId === "string"
  );
}

function parseIntent(value: unknown): AllowedIntent | null {
  if (typeof value !== "string") {
    return null;
  }
  return (ALLOWED_INTENTS as readonly string[]).includes(value) ? (value as AllowedIntent) : null;
}

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ success: false, error: "Request body must be an object" }, { status: 400 });
  }

  const input = body as { intent?: unknown; payload?: unknown };
  const intent = parseIntent(input.intent);
  if (!intent) {
    return Response.json(
      {
        success: false,
        error: `Unsupported intent. Allowed intents: ${ALLOWED_INTENTS.join(", ")}`,
        blocked: true,
      },
      { status: 400 },
    );
  }

  const payload = input.payload ?? {};
  if (hasMultiObjectPayload(payload)) {
    return Response.json(
      {
        success: false,
        error: "Batch or multi-object mutation is not allowed in this controlled Beta route.",
        blocked: true,
      },
      { status: 400 },
    );
  }

  try {
    const lead = await readInternalLeadByIdFromGoogleSheet(id);
    if (!lead) {
      return Response.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    if (intent === "status_update") {
      if (!payload || typeof payload !== "object") {
        return Response.json({ success: false, error: "status_update requires payload object" }, { status: 422 });
      }

      const parsedPayload = payload as Record<string, unknown>;
      const status = parsedPayload.status;
      if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status as LeadStatus)) {
        return Response.json({ success: false, error: "Invalid status value" }, { status: 422 });
      }

      const updatedLead = await updateInternalLeadInGoogleSheet(id, { status });
      return Response.json({
        success: true,
        intent,
        lead_id: id,
        lead: updatedLead,
        message: "Status saved (manual internal update). No downstream automation was triggered.",
      });
    }

    if (intent === "notes_update") {
      if (!payload || typeof payload !== "object") {
        return Response.json({ success: false, error: "notes_update requires payload object" }, { status: 422 });
      }

      const parsedPayload = payload as Record<string, unknown>;
      const notes = parsedPayload.internal_notes;
      if (typeof notes !== "string") {
        return Response.json({ success: false, error: "internal_notes must be a string" }, { status: 422 });
      }
      if (notes.length > 5000) {
        return Response.json({ success: false, error: "internal_notes exceeds 5000 characters" }, { status: 422 });
      }

      const updatedLead = await updateInternalLeadInGoogleSheet(id, { internal_notes: notes });
      return Response.json({
        success: true,
        intent,
        lead_id: id,
        lead: updatedLead,
        message: "Internal notes saved (manual internal update). No downstream automation was triggered.",
      });
    }

    const analysis = await buildIntakeAnalysis(lead);
    return Response.json({
      success: true,
      intent,
      lead_id: id,
      analysis,
      persisted: false,
      message: "AI Intake Analysis manually re-ran for this lead. No downstream automation was triggered.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mutate lead detail";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
