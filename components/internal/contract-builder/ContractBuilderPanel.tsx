import type { ContractRecord } from "@/lib/directorConsole/types";

export default function ContractBuilderPanel({ contract }: { contract: ContractRecord }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Contract Builder</h3>
      <p className="text-xs text-slate-500">内部草稿（可复制/可编辑），本阶段不对外自动发送。</p>
      <p className="text-sm"><b>language_mode:</b> {contract.language_mode}</p>
      <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{contract.estimate_draft}</pre>
      <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{contract.contract_draft}</pre>
    </section>
  );
}
