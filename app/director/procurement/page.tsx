import Link from "next/link";
import { listDirectorCases } from "@/lib/director/store";

export default function DirectorProcurementPage() {
  const rows = listDirectorCases().filter((item) => item.procurement).map((item) => item.procurement!);
  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow-sm"><h1 className="text-2xl font-semibold">Director Procurement Center</h1><p className="text-sm text-slate-600">Procurement review queue with case-linked recommendations.</p></section>
      <section className="rounded-xl bg-white p-4 shadow-sm"><table className="w-full text-sm"><thead><tr className="border-b"><th>Case</th><th>item / case</th><th>urgency / priority</th><th>vendor suggestion</th><th>price reference</th><th>stock / availability</th><th>Open</th></tr></thead><tbody>{rows.map((item) => <tr key={item.case_id} className="border-b align-top"><td>{item.case_id}</td><td>{item.service_driven_material_hint.join(", ")}</td><td>{item.urgency_driven_stock_priority}</td><td>{item.vendor_recommendation}</td><td>{item.price_reference}</td><td>{item.availability_note}</td><td><Link className="text-blue-700 underline" href={`/director/cases/${item.case_id}`}>Open Case</Link></td></tr>)}</tbody></table></section>
    </div>
  );
}
