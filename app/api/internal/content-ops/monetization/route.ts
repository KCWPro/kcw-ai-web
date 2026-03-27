import { readContentOpsState, writeContentOpsState } from "@/lib/contentOps/contentOpsStore";
import type { MonetizationExecutionLabel } from "@/lib/contentOps/types";

export async function GET() {
  const state = readContentOpsState();
  return Response.json({ success: true, overrides: state.monetizationOverrides });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      post_id?: string;
      label?: MonetizationExecutionLabel;
    };
    if (!body.post_id || !body.label) return Response.json({ success: false, error: "post_id and label required" }, { status: 400 });

    const next = writeContentOpsState((state) => {
      state.monetizationOverrides[body.post_id!] = body.label!;
      return state;
    });

    return Response.json({ success: true, overrides: next.monetizationOverrides });
  } catch {
    return Response.json({ success: false, error: "override update failed" }, { status: 500 });
  }
}
