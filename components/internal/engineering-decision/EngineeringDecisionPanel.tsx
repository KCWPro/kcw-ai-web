import type { EngineeringDecisionRecord } from "@/lib/directorConsole/types";

export default function EngineeringDecisionPanel({ decision }: { decision: EngineeringDecisionRecord }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Engineering Decision</h3>
      <p className="text-xs text-amber-700">Code / permit 相关内容为内部工程提示，需人工复核。</p>
      <p className="mt-2 text-sm"><b>job_type:</b> {decision.job_type}</p>
      <p className="text-sm"><b>recommended_scope:</b> {decision.recommended_scope}</p>
      <p className="text-sm"><b>workflow_steps:</b> {decision.workflow_steps.join(" -> ")}</p>
      <p className="text-sm"><b>labor:</b> ideal {decision.labor.ideal_hours}h / conservative {decision.labor.conservative_hours}h / crew {decision.labor.crew_size}</p>
      <p className="text-sm"><b>dispatch_strategy:</b> {decision.dispatch_strategy}</p>
      <p className="text-sm"><b>materials.required:</b> {decision.materials.required.join(", ")}</p>
    </section>
  );
}
