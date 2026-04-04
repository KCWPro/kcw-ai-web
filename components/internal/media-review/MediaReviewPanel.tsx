import type { MediaAsset } from "@/lib/directorConsole/types";

export default function MediaReviewPanel({ media }: { media: MediaAsset[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Media Review</h3>
      <p className="text-xs text-slate-500">图片可直接用于初步诊断；视频当前展示关键帧结构与后续接入位。</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {media.map((asset) => (
          <div key={asset.id} className="rounded-lg border border-slate-200 p-3 text-sm">
            <p className="font-medium">{asset.type.toUpperCase()} · {asset.id}</p>
            <p>Clarity: {asset.clarity}</p>
            <p>Focus: {asset.focus_area}</p>
            <p>Retake: {asset.retake_requested ? "建议补拍" : "不需要"}</p>
            <p>Suspicious: {asset.suspicious_points.join("; ")}</p>
            {asset.key_frames?.length ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
                {asset.key_frames.map((frame) => <li key={`${asset.id}-${frame.timestamp}`}>{frame.timestamp} - {frame.note}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
