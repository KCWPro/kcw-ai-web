import type { VisualDiagnosisRecord } from "@/lib/directorConsole/types";

export default function VisualDiagnosisPanel({ diagnosis }: { diagnosis: VisualDiagnosisRecord }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Visual Diagnosis</h3>
      <p className="mt-1 text-xs text-amber-700">内部初步判断，待人工确认，不构成绝对结论。</p>
      <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
        <p><b>issue_guess:</b> {diagnosis.issue_guess}</p>
        <p><b>confidence:</b> {(diagnosis.confidence * 100).toFixed(0)}%</p>
        <p><b>risk_level:</b> {diagnosis.risk_level}</p>
        <p><b>quote_readiness:</b> {diagnosis.quote_readiness}</p>
        <p><b>field_visit_recommended:</b> {diagnosis.field_visit_recommended ? "yes" : "no"}</p>
        <p><b>permit_risk_precheck:</b> {diagnosis.permit_risk_precheck}</p>
      </div>
      <p className="mt-2 text-sm"><b>safety_notice:</b> {diagnosis.safety_notice}</p>
      <p className="text-sm"><b>internal_summary:</b> {diagnosis.internal_summary}</p>
    </section>
  );
}
