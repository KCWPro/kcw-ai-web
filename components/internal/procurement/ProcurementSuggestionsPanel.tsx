import type { ProcurementSuggestionRecord } from "@/lib/directorConsole/types";

export default function ProcurementSuggestionsPanel({ items }: { items: ProcurementSuggestionRecord[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Procurement Suggestions</h3>
      <p className="text-xs text-slate-500">采购建议仅内部参考，本阶段不触发自动下单。</p>
      <div className="mt-2 space-y-2 text-sm">
        {items.map((item) => (
          <div key={item.item_name} className="rounded border border-slate-200 p-2">
            <p><b>{item.item_name}</b> · {item.preferred_vendor} / {item.alt_vendor}</p>
            <p>{item.price_reference} · {item.pickup_option}</p>
            <p className="text-xs text-slate-500">{item.availability_note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
