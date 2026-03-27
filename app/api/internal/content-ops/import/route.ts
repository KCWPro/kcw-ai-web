import { readContentOpsState, writeContentOpsState } from "@/lib/contentOps/contentOpsStore";

export async function GET() {
  const state = readContentOpsState();
  return Response.json({ success: true, importMeta: state.importMeta, sheetConfig: state.sheetConfig });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      source?: "csv" | "sheet" | "default_seed";
      cycleQualified?: boolean;
      sheet_id?: string;
      range?: string;
    };

    const next = writeContentOpsState((state) => {
      if (body.source) state.importMeta.currentSource = body.source;
      if (typeof body.cycleQualified === "boolean") state.importMeta.cycleQualified = body.cycleQualified;
      state.importMeta.lastImportedAt = new Date().toISOString();
      if (typeof body.sheet_id === "string") state.sheetConfig.sheet_id = body.sheet_id;
      if (typeof body.range === "string") state.sheetConfig.range = body.range;
      return state;
    });

    return Response.json({ success: true, importMeta: next.importMeta, sheetConfig: next.sheetConfig });
  } catch {
    return Response.json({ success: false, error: "import meta update failed" }, { status: 500 });
  }
}
