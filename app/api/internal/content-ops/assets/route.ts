import { listAssetBindings, listAssetsWithUploads, updateAssetMeta, uploadAsset } from "@/lib/contentOps/assetUploadStore";

export async function GET() {
  return Response.json({
    success: true,
    assets: listAssetsWithUploads(),
    bindings: listAssetBindings(),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      filename?: string;
      mime_type?: string;
      file_size_bytes?: number;
      preview_url?: string;
      project?: string;
      service_type?: string;
      tags?: string[];
      safe_for_public?: boolean;
      topic_id?: string;
      script_id?: string;
      post_plan_id?: string;
      notes?: string;
      talking_head_compatible?: boolean;
    };

    if (!body.filename || !body.mime_type || !body.preview_url) {
      return Response.json({ success: false, error: "filename / mime_type / preview_url required" }, { status: 400 });
    }

    const created = uploadAsset({
      filename: body.filename,
      mime_type: body.mime_type,
      file_size_bytes: body.file_size_bytes ?? 0,
      preview_url: body.preview_url,
      project: body.project,
      service_type: body.service_type,
      tags: body.tags ?? [],
      safe_for_public: body.safe_for_public,
      notes: body.notes,
      talking_head_compatible: body.talking_head_compatible,
      topic_id: body.topic_id,
      script_id: body.script_id,
      post_plan_id: body.post_plan_id,
    });
    return Response.json({ success: true, asset: created });
  } catch {
    return Response.json({ success: false, error: "asset upload failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      asset_id?: string;
      tags?: string[];
      safe_for_public?: boolean;
      notes?: string;
      service_type?: string;
    };
    if (!body.asset_id) {
      return Response.json({ success: false, error: "asset_id required" }, { status: 400 });
    }

    const updated = updateAssetMeta(body.asset_id, {
      tags: body.tags,
      safe_for_public: body.safe_for_public,
      notes: body.notes,
      service_type: body.service_type,
    });
    if (!updated) {
      return Response.json({ success: false, error: "asset not found in upload store" }, { status: 404 });
    }
    return Response.json({ success: true, asset: updated });
  } catch {
    return Response.json({ success: false, error: "asset update failed" }, { status: 500 });
  }
}
