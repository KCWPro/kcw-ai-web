import type { PermitReviewRecord } from "@/lib/directorConsole/types";

export default function PermitReviewPanel({ permit }: { permit: PermitReviewRecord }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Permit Review</h3>
      <p className="text-xs text-slate-500">city规则未实时联网，以下为内部建议与人工核实占位。</p>
      <p className="text-sm"><b>city:</b> {permit.city}</p>
      <p className="text-sm"><b>job_type:</b> {permit.job_type}</p>
      <p className="text-sm"><b>permit_status_recommendation:</b> {permit.permit_status_recommendation}</p>
      <p className="text-sm"><b>needs_manual_verification:</b> {permit.needs_manual_verification ? "yes" : "no"}</p>
      <p className="text-sm"><b>internal_warning:</b> {permit.internal_warning}</p>
    </section>
  );
}
