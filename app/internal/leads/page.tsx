import { Suspense } from "react";
import InternalLeadsClientPage from "./InternalLeadsClientPage";
import { internalLeads } from "@/lib/internalLeads";
import { readInternalLeadsFromGoogleSheet } from "@/lib/internalLeadsStore";

type InternalLeadRow = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  service_type: string;
  urgency: string;
  source: string;
  status: string;
  created_at?: string;
};

function buildMockFallback(): InternalLeadRow[] {
  return internalLeads.map((lead) => ({
    id: lead.id,
    customer_name: lead.customer_name,
    phone: lead.phone,
    city: lead.city,
    service_type: lead.service_type,
    urgency: lead.urgency,
    source: lead.source,
    status: lead.status,
    created_at: lead.created_at,
  }));
}

async function loadInitialLeads(): Promise<InternalLeadRow[]> {
  try {
    const leads = await readInternalLeadsFromGoogleSheet();
    if (leads.length === 0) return buildMockFallback();
    return [...leads].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  } catch {
    return buildMockFallback();
  }
}

export default async function InternalLeadsPage() {
  const initialLeads = await loadInitialLeads();

  return (
    <Suspense fallback={<InternalLeadsClientPage initialLeads={initialLeads} />}>
      <InternalLeadsClientPage initialLeads={initialLeads} />
    </Suspense>
  );
}
