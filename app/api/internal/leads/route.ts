import { internalLeads } from '@/lib/internalLeads';
import { readInternalLeadsFromGoogleSheet } from '@/lib/internalLeadsStore';

function buildMockFallback() {
  return internalLeads.map((lead) => ({
    id: lead.id,
    customer_name: lead.customer_name,
    phone: lead.phone,
    city: lead.city,
    service_type: lead.service_type,
    urgency: lead.urgency,
    property_type: '',
    source: lead.source,
    quote_amount: '',
    problem_duration: '',
    customer_notes: lead.intake_raw,
    ai_summary: lead.ai_summary,
    status: lead.status,
    created_at: lead.created_at,
  }));
}

export async function GET() {
  try {
    const leads = await readInternalLeadsFromGoogleSheet();

    if (leads.length > 0) {
      return Response.json({ success: true, leads, source: 'google_sheet' });
    }

    return Response.json({
      success: true,
      leads: buildMockFallback(),
      source: 'mock',
      warning: 'Google Sheet has no lead rows yet.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to read Google Sheet leads';

    return Response.json({
      success: false,
      leads: buildMockFallback(),
      source: 'mock',
      error: message,
    });
  }
}
