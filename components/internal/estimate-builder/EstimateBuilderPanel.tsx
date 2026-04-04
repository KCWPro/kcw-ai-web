import type { EstimateRecord } from "@/lib/directorConsole/types";

export default function EstimateBuilderPanel({ estimate }: { estimate: EstimateRecord }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Estimate Builder</h3>
      <p className="text-xs text-slate-500">未接入实时市场价格源，当前为内部规则估算结构。</p>
      <p className="mt-2 text-sm"><b>internal_cost.total:</b> ${estimate.internal_cost.total}</p>
      <p className="text-sm"><b>market_reference:</b> ${estimate.market_reference.low} - ${estimate.market_reference.high}</p>
      <p className="text-sm"><b>kcw_pricing.standard:</b> ${estimate.kcw_pricing.standard}</p>
      <p className="text-sm"><b>pricing_strategy:</b> {estimate.pricing_strategy}</p>
    </section>
  );
}
