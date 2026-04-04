import Link from "next/link";
import { notFound } from "next/navigation";
import MediaReviewPanel from "@/components/internal/media-review/MediaReviewPanel";
import VisualDiagnosisPanel from "@/components/internal/visual-diagnosis/VisualDiagnosisPanel";
import EngineeringDecisionPanel from "@/components/internal/engineering-decision/EngineeringDecisionPanel";
import EstimateBuilderPanel from "@/components/internal/estimate-builder/EstimateBuilderPanel";
import ContractBuilderPanel from "@/components/internal/contract-builder/ContractBuilderPanel";
import PermitReviewPanel from "@/components/internal/permit-review/PermitReviewPanel";
import ProcurementSuggestionsPanel from "@/components/internal/procurement/ProcurementSuggestionsPanel";
import AdminWorkflowPanel from "@/components/internal/admin-workflow/AdminWorkflowPanel";
import { directorLeadStatusLabels } from "@/lib/directorConsole/status";
import { toDirectorLead } from "@/lib/directorConsole/mockData";
import { readInternalLeadByIdFromGoogleSheet } from "@/lib/internalLeadsStore";
import { getLeadById } from "@/lib/internalLeads";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let rawLead = await readInternalLeadByIdFromGoogleSheet(id).catch(() => undefined);
  if (!rawLead) {
    const fallback = getLeadById(id);
    if (fallback) {
      rawLead = {
        id: fallback.id,
        customer_name: fallback.customer_name,
        phone: fallback.phone,
        city: fallback.city,
        service_type: fallback.service_type,
        urgency: fallback.urgency,
        status: fallback.status,
        created_at: fallback.created_at,
        customer_notes: fallback.intake_raw,
        ai_summary: fallback.ai_summary,
        source: fallback.source,
        property_type: "",
        quote_amount: "",
        problem_duration: "",
        internal_notes: "",
        last_updated_at: fallback.created_at,
      };
    }
  }

  if (!rawLead) notFound();

  const lead = toDirectorLead(rawLead, 0);

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <Link href="/internal/leads" className="text-sm text-slate-600">← Back to Inbox</Link>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Lead Detail Control Center</h1>
        <p className="text-sm">{lead.customer_name} · {lead.phone} · {lead.city}</p>
        <p className="text-sm">Status: {directorLeadStatusLabels[lead.status]}</p>
      </section>

      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2">
        <div>
          <h3 className="font-semibold">客户信息区</h3>
          <p className="text-sm">{lead.customer_name} / {lead.phone}</p>
          <p className="text-sm">{lead.address}</p>
        </div>
        <div>
          <h3 className="font-semibold">原始问题描述区</h3>
          <p className="text-sm">{lead.issue_summary}</p>
          <p className="text-sm">AI 初步分类：{lead.ai_initial_classification}</p>
        </div>
      </section>

      <MediaReviewPanel media={lead.media_assets} />
      <VisualDiagnosisPanel diagnosis={lead.visual_diagnosis} />
      <EngineeringDecisionPanel decision={lead.engineering_decision} />
      <EstimateBuilderPanel estimate={lead.estimate} />
      <ContractBuilderPanel contract={lead.contract} />
      <PermitReviewPanel permit={lead.permit_review} />
      <ProcurementSuggestionsPanel items={lead.procurement_suggestions} />
      <AdminWorkflowPanel leadId={lead.id} currentStatus={lead.status} />
    </main>
  );
}
