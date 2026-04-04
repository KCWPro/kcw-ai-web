import { readInternalLeadsFromGoogleSheet, readInternalLeadsFromMock } from '@/lib/internalLeadsStore';

export async function GET() {
  try {
    const leads = await readInternalLeadsFromGoogleSheet();

    if (leads.length > 0) {
      const sortedLeads = [...leads].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      return Response.json({ success: true, leads: sortedLeads, source: 'google_sheet' });
    }

    return Response.json({
      success: true,
      leads: readInternalLeadsFromMock(),
      source: 'mock',
      warning: 'Google Sheet has no lead rows yet.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to read Google Sheet leads';

    return Response.json({
      success: false,
      leads: readInternalLeadsFromMock(),
      source: 'mock',
      error: message,
    });
  }
}
