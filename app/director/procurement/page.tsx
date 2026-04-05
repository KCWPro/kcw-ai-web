const procurementItems = [
  { material: "4-inch cast iron stack", vendor: "Westline Supply", eta: "3 days", risk: "Medium" },
  { material: "Commercial-grade tankless unit", vendor: "AquaPro Dist.", eta: "7 days", risk: "High" },
  { material: "Backflow assembly kits", vendor: "Metro Mechanical", eta: "2 days", risk: "Low" },
];

export default function DirectorProcurementPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Procurement Control</h2>
        <p className="text-sm text-slate-300">Material commitment and lead-time risk dashboard for director-level release decisions.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 bg-slate-900 text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {procurementItems.map((item) => (
              <tr key={item.material}>
                <td className="px-4 py-3">{item.material}</td>
                <td className="px-4 py-3">{item.vendor}</td>
                <td className="px-4 py-3">{item.eta}</td>
                <td className="px-4 py-3">{item.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
